
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
  const bannerText1 =document.querySelector('.banner-text h1')
  const bannerText2 =document.querySelector('.banner-text p')
  bannerImage.style.transform = `translateY(${scrollPosition * 0.13}px)`;
  bannerText1 .style.transform = `translatex(${scrollPosition * 0.3}px)`;
  bannerText2 .style.transform = `translatex(${-scrollPosition * 0.3}px)`;
 
 
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

const API_URL = `/api/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sortBy}`;

function fetchPosts() {
  fetch('/api/api/ideas?page[number]=1&page[size]=10&append[]=small_image&append[]=medium_image&sort=-published_at', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(json => {
      console.log(json);
      json.data.forEach(post => {
        console.log('Image URL:', post.small_image);
        });
      renderPosts(json.data);
    });
}

// Render post cards
function renderPosts(posts) {
    if (posts.length === 0) {
        postList.innerHTML = "<p>Tidak ada post untuk ditampilkan.</p>";
        return;
    }

    postList.innerHTML = posts.map(post => {
        const imgUrl = (post.small_image && post.small_image[0]?.url) || 'https://via.placeholder.com/400x300.png?text=No+Image'; 
        const publishDate = new Date(post.published_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        return `
            <div class="card">
                <img src="${imgUrl}" loading="lazy" alt="${post.title}">
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


fetchPosts();

