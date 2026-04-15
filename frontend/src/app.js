// frontend/public/app.js
const API_BASE_URL = '/api/v1'

// Aguardar DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado')
  
  // Elementos do DOM
  const directoryPathInput = document.getElementById('directoryPath')
  const analyzeBtn = document.getElementById('analyzeBtn')
  const errorMessageEl = document.getElementById('errorMessage')
  const resultsContainer = document.getElementById('resultsContainer')
  const emptyState = document.getElementById('emptyState')
  const loadingState = document.getElementById('loadingState')
  const directoryTree = document.getElementById('directoryTree')
  const summaryPath = document.getElementById('summaryPath')
  const summarySize = document.getElementById('summarySize')

  // Verificar se elementos foram encontrados
  if (!directoryPathInput) {
    console.error('❌ directoryPathInput não encontrado')
    return
  }
  if (!analyzeBtn) {
    console.error('❌ analyzeBtn não encontrado')
    return
  }
  console.log('✅ Todos os elementos encontrados')

  /**
   * Mostra uma mensagem de erro
   */
  function showError(message) {
    console.log('Mostrando erro:', message)
    if (errorMessageEl) {
      errorMessageEl.textContent = message
      errorMessageEl.classList.remove('hidden')
      errorMessageEl.classList.add('show')
    }
    if (resultsContainer) resultsContainer.classList.add('hidden')
    if (loadingState) loadingState.classList.add('hidden')
    if (emptyState) emptyState.classList.add('hidden')

    setTimeout(() => {
      if (errorMessageEl) {
        errorMessageEl.classList.remove('show')
        errorMessageEl.classList.add('hidden')
      }
    }, 5000)
  }

  /**
   * Limpa a mensagem de erro
   */
  function clearError() {
    if (errorMessageEl) {
      errorMessageEl.classList.add('hidden')
      errorMessageEl.classList.remove('show')
    }
  }

  /**
   * Mostra estado de carregamento
   */
  function showLoading() {
    console.log('Mostrando carregamento')
    if (loadingState) loadingState.classList.remove('hidden')
    if (resultsContainer) resultsContainer.classList.add('hidden')
    if (emptyState) emptyState.classList.add('hidden')
    analyzeBtn.disabled = true
  }

  /**
   * Formata tamanho de arquivo para formato legível
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    if (i === 0) return bytes + ' ' + sizes[i]
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
  }

  /**
   * Cria um item da árvore de diretórios
   */
  function createTreeItem(item, maxDepth = 5, currentDepth = 0) {
    if (!item) {
      console.error('createTreeItem: item é null/undefined')
      return document.createElement('div')
    }

    const div = document.createElement('div')
    div.className = 'tree-item'

    // Verificar se tem filhos
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0 && currentDepth < maxDepth
    
    if (hasChildren) {
      div.classList.add('expandable', 'expanded')
    }

    // Informações (layout principal em grid)
    const info = document.createElement('div')
    info.className = 'tree-item-info'

    // Coluna 1: Ícone + Nome
    const nameSection = document.createElement('div')
    nameSection.style.display = 'flex'
    nameSection.style.alignItems = 'center'
    nameSection.style.gap = 'var(--spacing-unit)'
    nameSection.style.wordBreak = 'break-word'

    // Ícone
    const icon = document.createElement('span')
    icon.className = 'tree-item-icon'
    
    if (hasChildren) {
      icon.textContent = '📁'
      nameSection.style.cursor = 'pointer'
      nameSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-open')) return
        div.classList.toggle('collapsed')
        div.classList.toggle('expanded')
      })
    } else if (item.isDirectory) {
      icon.textContent = '📂'
    } else {
      icon.textContent = '📄'
    }
    nameSection.appendChild(icon)

    // Nome
    const name = document.createElement('span')
    name.textContent = item.name || 'unnamed'
    name.style.fontWeight = '600'
    nameSection.appendChild(name)

    info.appendChild(nameSection)

    // Coluna 2: Tamanho
    const sizeSpan = document.createElement('div')
    sizeSpan.className = 'tree-item-size'
    sizeSpan.textContent = item.sizeFormatted || formatFileSize(item.size)
    info.appendChild(sizeSpan)

    // Coluna 3: Percentual
    if (item.percentage) {
      const percentSpan = document.createElement('div')
      percentSpan.className = 'tree-item-percent'
      percentSpan.textContent = `${item.percentage}%`
      info.appendChild(percentSpan)
    }

    // Coluna 4: Botão de abrir
    if (item.isDirectory) {
      const openBtn = document.createElement('button')
      openBtn.className = 'btn btn-open'
      openBtn.textContent = '📂 Abrir'
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        openDirectory(item.path)
      })
      info.appendChild(openBtn)
    }

    div.appendChild(info)

    // Filhos
    if (hasChildren) {
      const childrenContainer = document.createElement('div')
      childrenContainer.className = 'tree-item-children'

      item.children.forEach((child) => {
        try {
          childrenContainer.appendChild(createTreeItem(child, maxDepth, currentDepth + 1))
        } catch (err) {
          console.error('Erro ao criar child:', err, child)
        }
      })

      div.appendChild(childrenContainer)
    }

    return div
  }

  /**
   * Analisa um diretório
   */
  async function analyzeDirectory() {
    const path = directoryPathInput.value.trim()
    console.log('analyzeDirectory chamado com:', path)

    if (!path) {
      showError('Por favor, insira um caminho de diretório')
      return
    }

    clearError()
    showLoading()

    try {
      console.log('Fazendo fetch para:', `${API_BASE_URL}/analyze`)
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      console.log('Status da resposta:', response.status)

      const data = await response.json()
      console.log('Dados da resposta:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao analisar diretório')
      }

      console.log('Atualizando UI')
      
      // Atualizar UI
      if (loadingState) loadingState.classList.add('hidden')
      if (emptyState) emptyState.classList.add('hidden')
      if (resultsContainer) resultsContainer.classList.remove('hidden')
      analyzeBtn.disabled = false

      // Preencher resumo
      if (summaryPath) summaryPath.textContent = data.data.path
      if (summarySize) summarySize.textContent = data.data.sizeFormatted || formatFileSize(data.data.size)

      // Renderizar árvore
      if (directoryTree) {
        directoryTree.innerHTML = ''
        directoryTree.appendChild(createTreeItem(data.data))
      }

      console.log('✅ Análise concluída com sucesso')
      
      // Focar no resultado
      if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      console.error('❌ Erro em analyzeDirectory:', error)
      if (loadingState) loadingState.classList.add('hidden')
      if (emptyState) emptyState.classList.add('hidden')
      analyzeBtn.disabled = false
      showError(error.message || 'Erro ao analisar diretório')
    }
  }

  /**
   * Abre um diretório no explorador
   */
  async function openDirectory(path) {
    try {
      const response = await fetch(`${API_BASE_URL}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao abrir diretório')
      }
    } catch (error) {
      showError(error.message || 'Erro ao abrir diretório')
    }
  }

  /**
   * Event Listeners
   */
  console.log('Adicionando event listeners')
  
  analyzeBtn.addEventListener('click', () => {
    console.log('Botão Analisar clicado')
    analyzeDirectory()
  })

  directoryPathInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressionado')
      analyzeDirectory()
    }
  })

  // Carregar último caminho
  const lastPath = localStorage.getItem('lastDirectoryPath')
  if (lastPath) {
    directoryPathInput.value = lastPath
  }

  // Salvar caminho ao mudar
  directoryPathInput.addEventListener('change', () => {
    localStorage.setItem('lastDirectoryPath', directoryPathInput.value)
  })

  console.log('✅ Inicialização concluída - Aplicação pronta!')
})


