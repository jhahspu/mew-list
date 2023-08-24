document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", appReady)
  : appReady()

const products = []
let myList = []

async function appReady() {
  // console.log("document ready")

  fetch('/data.csv')
    .then(response => response.text())
    .then(csvContent => {
      const lines = csvContent.split('\n')
      lines.forEach(line => {
        const values = line.split('|')
        if (values.length === 2) {
          const sku = values[0].replaceAll(`"`,"")
          const desc = values[1].replaceAll(`"`,"")
          products.push({ sku, desc })
        }
      })
      console.log(`found ${products.length} products`)
    })
  document.getElementById("search").addEventListener("input", debouncedSearch)

  if (localStorage.getItem("mew-list") !== null) {
    myList = [...JSON.parse(localStorage.getItem("mew-list"))]
    processMyList(myList)
  } else {
    document.querySelector("[data-listitems]").textContent = "upss... your list is null"
    console.log("mew-list not there")
  }

  document.querySelector("[data-emptylist]").addEventListener("click", () => {
    myList = []
    processMyList(myList)
  })
  
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
    // console.log(e.target.value)
    const searchResults = searchProducts(e.target.value.toLowerCase())
    // console.log(searchResults)
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

      const col0 = document.createElement("td")
      const btnAdd = document.createElement("button")
      btnAdd.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      `
      btnAdd.classList.add("add")
      btnAdd.addEventListener("click", () => {
        updateMyList("add", line.sku, line.desc)
      })
      col0.appendChild(btnAdd)
      row.appendChild(col0)

      const col1 = document.createElement("th")
      col1.textContent = line.sku
      row.appendChild(col1)

      const col2 = document.createElement("td")
      col2.textContent = line.desc
      row.appendChild(col2)

      resContainer.appendChild(row)
    })
  } else {
    resContainer.textContent = "no results"
  }
}

function updateMyList(acc, sku, desc) {
  if (acc === "add") {
    let index = myList.findIndex(x => x.sku === sku)
    index === -1 && myList.push({sku,desc})
  } else {
    myList.splice(myList.findIndex(el => el.sku === sku), 1)
  }
  
  processMyList(myList)
  // console.log(myList)
}

function processMyList(data) {
  const resContainer = document.querySelector("[data-mylist]")
  resContainer.textContent = ""
  document.querySelector("[data-listitems]").textContent = `Your list has ${data.length} items`

  if (data.length > 0) {
    data.forEach(line => {
      const row = document.createElement("tr")

      const col0 = document.createElement("td")
      const btn = document.createElement("button")
      btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      `
      btn.classList.add("rem")
      btn.addEventListener("click", () => {
        updateMyList(line.sku, line.desc)
      })
      col0.appendChild(btn)
      row.appendChild(col0)

      const col1 = document.createElement("th")
      col1.textContent = line.sku
      row.appendChild(col1)

      const col2 = document.createElement("td")
      col2.textContent = line.desc
      row.appendChild(col2)

      resContainer.appendChild(row)
    })
  } else {
    resContainer.textContent = "your list is empty"
  }

  localStorage.setItem("mew-list", JSON.stringify(data))
}