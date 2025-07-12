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

let currentPage = 1;
let sortBy = '-published_at';
let perPage = 10;

sortSelect.value = sortBy;
perPageSelect.value = perPage;

// Daftar placeholder images sebagai fallback
const placeholderImages = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6',
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8',
  'https://picsum.photos/400/300?random=9',
  'https://picsum.photos/400/300?random=10'
];

// Fungsi untuk mendapatkan placeholder berdasarkan index
function getPlaceholderImage(index) {
  return placeholderImages[index % placeholderImages.length];
}

// Fungsi untuk mengonversi gambar ke data URL melalui canvas (mengatasi CORS)
function convertImageToDataUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;
        
        ctx.drawImage(this, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

// Fungsi untuk mencoba berbagai strategi loading gambar
async function loadImageWithFallback(originalUrl, fallbackIndex = 0) {
  const strategies = [
    // Strategi 1: Gunakan proxy lokal
    () => `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`,
    
    // Strategi 2: Gunakan CORS proxy gratis
    () => `https://cors-anywhere.herokuapp.com/${originalUrl}`,
    
    // Strategi 3: Gunakan proxy alternatif
    () => `https://api.allorigins.win/get?url=${encodeURIComponent(originalUrl)}`,
    
    // Strategi 4: Coba akses langsung dengan cache busting
    () => `${originalUrl}?t=${Date.now()}`,
    
    // Strategi 5: Gunakan placeholder dengan warna berbeda
    () => getPlaceholderImage(fallbackIndex)
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const url = strategies[i]();
      console.log(`Trying strategy ${i + 1}: ${url}`);
      
      const success = await new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          resolve(false);
        }, 5000); // 5 detik timeout
        
        img.onload = function() {
          clearTimeout(timeout);
          resolve(true);
        };
        
        img.onerror = function() {
          clearTimeout(timeout);
          resolve(false);
        };
        
        img.src = url;
      });
      
      if (success) {
        console.log(`Strategy ${i + 1} successful`);
        return strategies[i]();
      }
    } catch (error) {
      console.log(`Strategy ${i + 1} failed:`, error);
    }
  }
  
  // Jika semua strategi gagal, gunakan placeholder
  return getPlaceholderImage(fallbackIndex);
}

// Fungsi untuk mengekstrak URL gambar dari response API
function extractImageUrl(imageData) {
  if (!imageData) return null;
  
  if (Array.isArray(imageData)) {
    if (imageData.length === 0) return null;
    imageData = imageData[0];
  }
  
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  if (typeof imageData === 'object') {
    return imageData.url || imageData.src || imageData.href || imageData.path;
  }
  
  return null;
}

// Fungsi untuk memproses URL gambar
function processImageUrl(url) {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  if (url.startsWith('/')) {
    return 'https://assets.suitdev.com' + url;
  }
  
  return 'https://assets.suitdev.com/' + url;
}

function fetchPosts() {
  const API_URL = `/api/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sortBy}`;
  
  fetch(API_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
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
      renderPosts(json.data);
      
      if (json.meta) {
        renderPagination(json.meta);
        updateShowingText(json.meta);
      }
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
      postList.innerHTML = `<div style="text-align: center; padding: 20px; color: #666;">
        <p>Error loading posts: ${error.message}</p>
        <button onclick="fetchPosts()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>`;
    });
}

// Render posts dengan loading gambar yang robust
async function renderPosts(posts) {
    if (!posts || posts.length === 0) {
        postList.innerHTML = "<p style='text-align: center; padding: 20px; color: #666;'>Tidak ada post untuk ditampilkan.</p>";
        return;
    }

    postList.innerHTML = Array.from({length: perPage}, (_, i) => `
        <div class="card" style="opacity: 0.7;">
            <div style="width: 100%; height: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 5px;"></div>
            <div class="card-content">
                <div style="height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 3px; margin: 8px 0;"></div>
                <div style="height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 3px;"></div>
            </div>
        </div>
    `).join('');
    
    if (!document.querySelector('#loading-style')) {
        const style = document.createElement('style');
        style.id = 'loading-style';
        style.textContent = `
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const batchSize = 3; 
    const postCards = [];
    
    for (let i = 0; i < posts.length; i += batchSize) {
        const batch = posts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (post, batchIndex) => {
                const globalIndex = i + batchIndex;
                

                const smallImageUrl = extractImageUrl(post.small_image);
                const mediumImageUrl = extractImageUrl(post.medium_image);
                
                console.log(`Post ${globalIndex + 1}: ${post.title}`);
                console.log('Small image URL:', smallImageUrl);
                console.log('Medium image URL:', mediumImageUrl);
                
                let imageUrl = smallImageUrl || mediumImageUrl;
                
                if (imageUrl) {
                    imageUrl = processImageUrl(imageUrl);
                    console.log('Processed image URL:', imageUrl);
                }
                
                const finalImageUrl = imageUrl ? 
                    await loadImageWithFallback(imageUrl, globalIndex) : 
                    getPlaceholderImage(globalIndex);
                

                const publishDate = new Date(post.published_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).toUpperCase();

                return `
                    <div class="card" style="animation: fadeIn 0.5s ease-in;">
                        <img src="${finalImageUrl}" 
                             loading="lazy" 
                             alt="${post.title || 'Post image'}"
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px;"
                             onerror="this.src='${getPlaceholderImage(globalIndex)}'; console.log('Final fallback used for:', '${post.title}');">
                        <div class="card-content">
                            <p class="publish-date">${publishDate}</p>
                            <div class="title">${post.title || 'Untitled'}</div>
                        </div>
                    </div>
                `;
            })
        );
        
        postCards.push(...batchResults);
        
        
        if (i === 0) {
            postList.innerHTML = postCards.join('');
        } else {
            postList.innerHTML = postCards.join('');
        }
    }
    
 
    if (!document.querySelector('#fadein-style')) {
        const style = document.createElement('style');
        style.id = 'fadein-style';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
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
      fetchPosts();
    });
    pagination.appendChild(btn);
  }
}

sortSelect.addEventListener('change', () => {
  sortBy = sortSelect.value;
  currentPage = 1;
  fetchPosts();
});

perPageSelect.addEventListener('change', () => {
  perPage = parseInt(perPageSelect.value);
  currentPage = 1;
  fetchPosts();
});

// Initial fetch
fetchPosts();