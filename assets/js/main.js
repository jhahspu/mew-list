document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", appReady)
  : appReady()

const products = []

async function appReady() {
  console.log("document ready")

  fetch('/data.csv')
    .then(response => response.text())
    .then(csvContent => {
      const lines = csvContent.split('\n')
      lines.forEach(line => {
        const values = line.split(',')
        if (values.length === 2) {
          const sku = values[0]
          const desc = values[1]
          products.push({ sku, desc })
        }
      })
    })
  document.getElementById("search").addEventListener("input", debouncedSearch)
}

function searchProducts(searchTerm) {
  const searchResults = [];

  products.forEach(product => {
    const sl = product.sku.toLowerCase()
    const dl = product.desc.toLowerCase()

    if (sl.includes(searchTerm) || dl.includes(searchTerm)) {
      searchResults.push({
        sku: product.sku,
        desc: product.desc
      })
    }
  })
  searchResults.sort((a, b) => a.desc.localeCompare(b.desc))
  return searchResults;
}

function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

const debouncedSearch = debounce((e) => {
  if (e.target.value) {
    const searchResults = searchProducts(e.target.value.toLowerCase())
    processResults(searchResults)
  } else {
    document.querySelector("[data-results]").textContent = ""
  }
}, 1000)

function processResults(data) {
  const resContainer = document.querySelector("[data-results]")
  resContainer.textContent = ""

  if (data.length > 0) {
    data.forEach(line => {
      const row = document.createElement("tr")

      const col1 = document.createElement("th")
      col1.textContent = line.sku
      row.appendChild(col1)

      const col2 = document.createElement("span")
      col2.textContent = line.desc
      row.appendChild(col2)

      resContainer.appendChild(row)
    })
  } else {
    resContainer.textContent = "no results"
  }
}