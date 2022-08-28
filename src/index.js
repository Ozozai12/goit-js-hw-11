const axios = require('axios').default;
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '29521336-a1469f4927f87a0f3197cf310';
const URL = 'https://pixabay.com/api/?key=';

const searchForm = document.querySelector('.search-form');
const queryInput = document.querySelector('[name="searchQuery"]');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a');

class PhotoApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  imagesFetch() {
    return fetch(
      `${URL}${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`
    )
      .then(response => response.json())
      .then(photos => {
        this.page += 1;

        return photos;
      });
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}



const photoApiService = new PhotoApiService();

searchForm.addEventListener('submit', imageSearching);
loadMoreBtn.addEventListener('click', moreLoading);

function imageSearching(evt) {
  evt.preventDefault();
  if (!queryInput.value) {
    return Notiflix.Notify.warning('Please type something to begin searching.');
  }

  loadMoreBtn.style.display = 'none';
  photoApiService.query = queryInput.value;
  photoApiService.resetPage();
  photoApiService
    .imagesFetch()
    .then(photos => {
      gallery.innerHTML = '';
      gallery.insertAdjacentHTML('beforeend', renderGallery(photos.hits));
      lightbox.refresh();

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 0.4,
        behavior: 'smooth',
      });

      loadMoreBtn.style.display = 'block';

      if (photos.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );

        hideMoreBtn();
        return;
      }

      if (photos.totalHits === photos.hits.length) {
        hideMoreBtn();
      }

      Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
      
    })
    .catch('error');
}

function renderGallery(photos) {
  return photos
    .map(photo => {
      return `<a class="photo-card" href="${photo.largeImageURL}">
                <img class="photo-card__image" src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b>${photo.likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b>${photo.views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b>${photo.comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b>${photo.downloads}
                    </p>
                </div>
                </a>`;
    })
    .join('');
}


function moreLoading() {
  photoApiService
    .imagesFetch()
    .then(photos => {
      gallery.insertAdjacentHTML('beforeend', renderGallery(photos.hits));
      if (photos.totalHits === photos.hits.length) {
        hideMoreBtn();
      }
      if (Math.round(photos.totalHits / 40) < photoApiService.page) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        hideMoreBtn();
      }
      console.log(photos);
    })
    .catch('error');
}

function hideMoreBtn() {
  loadMoreBtn.style.display = 'none';
}
