// frontend/src/app.js

const API_BASE_URL = '/api/v1'

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

/**
 * Mostra uma mensagem de erro
 */
function showError(message) {
  errorMessageEl.textContent = message
  errorMessageEl.classList.remove('hidden')
  errorMessageEl.classList.add('show')
  resultsContainer.classList.add('hidden')
  loadingState.classList.add('hidden')
  emptyState.classList.add('hidden')

  setTimeout(() => {
    errorMessageEl.classList.remove('show')
    errorMessageEl.classList.add('hidden')
  }, 5000)
}

/**
 * Limpa a mensagem de erro
 */
function clearError() {
  errorMessageEl.classList.add('hidden')
  errorMessageEl.classList.remove('show')
}

/**
 * Mostra estado de carregamento
 */
function showLoading() {
  loadingState.classList.remove('hidden')
  resultsContainer.classList.add('hidden')
  emptyState.classList.add('hidden')
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
  const div = document.createElement('div')
  div.className = 'tree-item'

  // Verificar se tem filhos
  const hasChildren = item.children && item.children.length > 0 && currentDepth < maxDepth
  if (hasChildren) {
    div.classList.add('expandable', 'expanded')
  }

  // Header do item
  const itemName = document.createElement('div')
  itemName.className = 'tree-item-name'

  if (hasChildren) {
    const icon = document.createElement('span')
    icon.className = 'tree-item-icon'
    icon.textContent = '📁'
    itemName.appendChild(icon)

    // Adicionar evento de click para expandir/recolher
    itemName.style.cursor = 'pointer'
    itemName.addEventListener('click', (e) => {
      if (e.target !== itemName && !e.target.classList.contains('btn-open')) return
      div.classList.toggle('collapsed')
      div.classList.toggle('expanded')
    })
  } else if (item.isDirectory) {
    const icon = document.createElement('span')
    icon.className = 'tree-item-icon'
    icon.textContent = '📂'
    itemName.appendChild(icon)
  } else {
    const icon = document.createElement('span')
    icon.className = 'tree-item-icon'
    icon.textContent = '📄'
    itemName.appendChild(icon)
  }

  // Nome da pasta/arquivo
  const name = document.createElement('span')
  name.textContent = item.name
  itemName.appendChild(name)

  div.appendChild(itemName)

  // Informações
  const info = document.createElement('div')
  info.className = 'tree-item-info'

  // Tamanho
  const sizeSpan = document.createElement('div')
  sizeSpan.className = 'tree-item-size'
  sizeSpan.textContent = item.sizeFormatted || formatFileSize(item.size)
  info.appendChild(sizeSpan)

  // Percentual (se houver pai)
  if (item.percentage) {
    const percentSpan = document.createElement('div')
    percentSpan.className = 'tree-item-percent'
    percentSpan.textContent = `${item.percentage}%`
    info.appendChild(percentSpan)
  }

  // Botão de abrir (apenas para diretórios)
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

  // Barra de progresso
  if (item.percentage) {
    const progressContainer = document.createElement('div')
    progressContainer.className = 'progress-bar'

    const progressFill = document.createElement('div')
    progressFill.className = 'progress-fill'
    progressFill.style.width = item.percentage + '%'
    progressContainer.appendChild(progressFill)

    div.appendChild(progressContainer)
  }

  // Filhos (se existirem)
  if (hasChildren) {
    const childrenContainer = document.createElement('div')
    childrenContainer.className = 'tree-item-children'

    item.children.forEach((child) => {
      childrenContainer.appendChild(createTreeItem(child, maxDepth, currentDepth + 1))
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

  if (!path) {
    showError('Por favor, insira um caminho de diretório')
    return
  }

  clearError()
  showLoading()

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao analisar diretório')
    }

    // Atualizar UI
    loadingState.classList.add('hidden')
    emptyState.classList.add('hidden')
    resultsContainer.classList.remove('hidden')
    analyzeBtn.disabled = false

    // Preencher resumo
    summaryPath.textContent = data.data.path
    summarySize.textContent = data.data.sizeFormatted || formatFileSize(data.data.size)

    // Renderizar árvore
    directoryTree.innerHTML = ''
    directoryTree.appendChild(createTreeItem(data.data))

    // Focar no resultado
    resultsContainer.scrollIntoView({ behavior: 'smooth' })
  } catch (error) {
    loadingState.classList.add('hidden')
    emptyState.classList.add('hidden')
    analyzeBtn.disabled = false
    showError(error.message || 'Erro ao analisar diretório')
  }
}

/**
 * Abre um diretório no explorador do sistema
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
analyzeBtn.addEventListener('click', analyzeDirectory)

directoryPathInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    analyzeDirectory()
  }
})

/**
 * Preencher com diretório padrão (opcional)
 */
window.addEventListener('load', () => {
  // Você pode definir um diretório padrão aqui se desejar
  // directoryPathInput.value = 'C:\\Users'

  // Exemplo de teste: use localStorage para persistir o último caminho
  const lastPath = localStorage.getItem('lastDirectoryPath')
  if (lastPath) {
    directoryPathInput.value = lastPath
  }
})

/**
 * Salvar último caminho no localStorage
 */
directoryPathInput.addEventListener('change', () => {
  localStorage.setItem('lastDirectoryPath', directoryPathInput.value)
})
