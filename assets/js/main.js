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
  console.log(searchTerm)
  if (searchTerm === "") return
  const searchResults = products.filter(product => {
    return (
      product.sku.toLowerCase().includes(searchTerm) ||
      product.desc.toLowerCase().includes(searchTerm)
    )
  })

  return searchResults
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
  }
}, 1000)

function processResults(data) {
  const divRes = document.querySelector("[data-results]")
  divRes.textContent = ""

  if (data.length > 0) {
    data.forEach(line => {
      const divParent = document.createElement("div")
      const spanSKU = document.createElement("span")
      divParent.appendChild(spanSKU)
      spanSKU.textContent = line.SKU
      const spanDESC = document.createElement("span")
      spanDESC.textContent = line.desc
      divParent.appendChild(spanDESC)
      divRes.appendChild(divParent)
    })
  } else {
    divRes.textContent = "no results"
  }
}