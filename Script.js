let lastScrollTop = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop === 0) {
    header.style.top = "0";
    header.style.opacity= "100%";
  } else if (scrollTop > lastScrollTop) {
    header.style.top = "-100px";
  } else {
    header.style.top = "0";
    header.style.opacity = "70%";
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

const currentPage2 = window.location.pathname.split("/").pop();
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute("href") === currentPage2) {
    link.classList.add("active");
  }
});

const tombol = document.querySelector('.tombol');
const menu = document.querySelector('.menu');

tombol.addEventListener('click', () => {
    menu.classList.toggle('aktif');
    tombol.classList.toggle('aktif'); 
});

window.addEventListener('scroll', () => {
  const bannerImage = document.querySelector('.banner-img');
  const scrollPosition = window.pageYOffset;
  const bannerText1 = document.querySelector('.banner-text h1')
  const bannerText2 = document.querySelector('.banner-text p')
  bannerImage.style.transform = `translateY(${scrollPosition * 0.13}px)`;
  bannerText1.style.transform = `translatex(${scrollPosition * 0.3}px)`;
  bannerText2.style.transform = `translatex(${-scrollPosition * 0.3}px)`;
});

const postList = document.getElementById('post-list');
const sortSelect = document.getElementById('sort');
const perPageSelect = document.getElementById('perPage');
const pagination = document.getElementById('pagination');
const showingStatus = document.getElementById('showing-status');

let currentPage = parseInt(localStorage.getItem('page')) || 1;
let sortBy = localStorage.getItem('sortBy') || '-published_at';
let perPage = parseInt(localStorage.getItem('perPage')) || 10;

sortSelect.value = sortBy;
perPageSelect.value = perPage;

function fetchPosts() {
  // Gunakan parameter dinamis yang sudah di-set
  const API_URL = `/api/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sortBy}`;
  
  fetch(API_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(json => {
      console.log('API Response:', json);
      
      // Debug: Log setiap post dan URL gambarnya
      json.data.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, post.title);
        console.log('Small image:', post.small_image);
        console.log('Medium image:', post.medium_image);
      });
      
      renderPosts(json.data);
      
      // Handle pagination dan showing status jika ada metadata
      if (json.meta) {
        renderPagination(json.meta);
        updateShowingText(json.meta);
      }
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
      postList.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
    });
}

// Render post cards
function renderPosts(posts) {
    if (posts.length === 0) {
        postList.innerHTML = "<p>Tidak ada post untuk ditampilkan.</p>";
        return;
    }

    postList.innerHTML = posts.map(post => {
        // Coba berbagai kemungkinan struktur data gambar
        let imgUrl = 'https://via.placeholder.com/400x300.png?text=No+Image';
        
        // Debug: Log struktur data untuk setiap post
        console.log('Processing post:', post.title);
        console.log('Small image data:', post.small_image);
        
        // Coba beberapa kemungkinan struktur data
        if (post.small_image) {
            if (Array.isArray(post.small_image) && post.small_image.length > 0) {
                imgUrl = post.small_image[0].url || post.small_image[0];
            } else if (typeof post.small_image === 'string') {
                imgUrl = post.small_image;
            } else if (post.small_image.url) {
                imgUrl = post.small_image.url;
            }
        }
        
        // Fallback ke medium_image jika small_image tidak ada
        if (imgUrl === 'https://via.placeholder.com/400x300.png?text=No+Image' && post.medium_image) {
            if (Array.isArray(post.medium_image) && post.medium_image.length > 0) {
                imgUrl = post.medium_image[0].url || post.medium_image[0];
            } else if (typeof post.medium_image === 'string') {
                imgUrl = post.medium_image;
            } else if (post.medium_image.url) {
                imgUrl = post.medium_image.url;
            }
        }
        
        console.log('Final image URL:', imgUrl);
        
        const publishDate = new Date(post.published_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        return `
            <div class="card">
                <img src="${imgUrl}" loading="lazy" alt="${post.title}" onerror="this.src='https://via.placeholder.com/400x300.png?text=Image+Error'">
                <div class="card-content">
                    <p class="publish-date">${publishDate}</p>
                    <div class="title">${post.title}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateShowingText(meta) {
  const start = (meta.current_page - 1) * meta.per_page + 1;
  const end = Math.min(meta.total, meta.current_page * meta.per_page);
  showingStatus.textContent = `Showing ${start} - ${end} of ${meta.total}`;
}

function renderPagination(meta) {
  const totalPages = meta.last_page;
  pagination.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      localStorage.setItem('page', i);
      fetchPosts();
    });
    pagination.appendChild(btn);
  }
}

sortSelect.addEventListener('change', () => {
  sortBy = sortSelect.value;
  localStorage.setItem('sortBy', sortBy);
  currentPage = 1;
  localStorage.setItem('page', currentPage);
  fetchPosts();
});

perPageSelect.addEventListener('change', () => {
  perPage = parseInt(perPageSelect.value);
  localStorage.setItem('perPage', perPage);
  currentPage = 1;
  localStorage.setItem('page', currentPage);
  fetchPosts();
});

// Initial fetch
fetchPosts();