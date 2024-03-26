import { useState, useEffect } from 'react';
import viteLogo from '/vite.svg';
import './App.css';

interface Show {
  id: number;
  name: string;
  rating: { average: number };
  summary: string;
  genres: string[];
  image: {
    medium: string;
    original: string;
  };
}

interface FavoriteShow {
  id: number;
  name: string;
}


// App function
function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [shows, setShows] = useState<Show[]>([]);
  const [favorites, setFavorites] = useState<FavoriteShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load favorites from local storage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Update local storage when favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // function to strip html tags from summary
  const stripHtmlTags = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // function to search for shows
  const searchShows = async () => {
    try {
      const searchResponse = await fetch(`https://api.tvmaze.com/api/search/shows?q=${searchTerm}`);
      const searchJson: any[] = await searchResponse.json();

      const searchPeopeResponse = await fetch(`https://api.tvmaze.com/api/search/people?q=${searchTerm}`);
      const searchPeopleJson: any[] = await searchPeopeResponse.json();

      console.log(searchPeopleJson);

      console.log(searchJson);

      if (searchJson && searchJson.length > 0) {
        const processedShows: Show[] = searchJson.map((item) => ({
          id: item.show.id,
          name: item.show.name,
          rating: item.show.rating ? item.show.rating : 'N/A',
          genres: item.show.genres,
          summary: stripHtmlTags(item.show.summary),
          image: item.show.image,
        }));
        setShows(processedShows);
      }

      // WIP for people search
      if (searchPeopleJson && searchPeopleJson.length > 0) {
        const processedShows: Show[] = searchPeopleJson.map((item) => ({
          id: item.person.id,
          name: item.person.name,
          rating: item.person.rating ? item.person.rating : 'N/A',
          genres: item.person.genres,
          summary: stripHtmlTags(item.person.summary),
          image: item.person.image,
        }));
        setShows(processedShows);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addFavorite = (show: Show) => {
    const newFavorite: FavoriteShow = {
      id: show.id,
      name: show.name,
    };
    setFavorites((prevFavorites) => {
      const updatedFavorites = [...prevFavorites, newFavorite];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  // function to remove favorite
  const removeFavorite = (show: FavoriteShow) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter(
        (favorite) => favorite.id !== show.id
      );
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  // function to open modal
  const openModel = (show: Show) => {
    setSelectedShow(show);
    setShowModal(true);
  };

  // function to close modal
  const closeModel = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="app">
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <h1>TV Show Search</h1>
        <h3>Vite + React + TypeScript</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter a TV show / People search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          <button className="search-button" onClick={searchShows}>
            Search
          </button>
        </div>

        <div className="card-grid">
          {shows.map((show) => (
            <div key={show.id} className="card">
              <img src={show.image.medium} alt={show.name} />
              <h3 className="card-title">{show.name}</h3>
              <p className="card-rating">
              Rating: {show.rating?.average || 'N/A'}
              </p>
              <p className="card-genres"> Genres: {show.genres.join(', ')}</p>
              <p className="card-description">{show.summary}</p>
              <button className="card-button" onClick={() => addFavorite(show)}>
                Add to Favorites
              </button>
            </div>
          ))}
        </div>

        <div className="favorites-section">
          <h2>Favorites Shows</h2>
          <ul className="favorite-list">
            {favorites.map((favorite) => (
              <li key={favorite.id} className="favorite">
                <span
                  onClick={() =>
                    openModel(shows.find((show) => show.id === favorite.id)!)
                  }
                  className="favorite-name"
                >
                  {favorite.name}
                </span>
                <button
                  className="favorite-button"
                  onClick={() => removeFavorite(favorite)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedShow && showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModel}>
                &times;
              </span>
              <img src={selectedShow.image.original} alt={selectedShow.name} />
              <h3 className="modal-title">{selectedShow.name}</h3>
              <p className="modal-rating">
                Rating: {selectedShow.rating?.average || 'N/A'}
              </p>
              <p className="modal-genres">
                Genres: {selectedShow.genres.join(' , ')}
              </p>
              <p className="modal-description">{selectedShow.summary}</p>
            </div>
          </div>
        )}
      </div>

      <footer>
        <p>
          Made with ❤️ by{'Nikulkumar Goyani'}
          <a href="" target="_blank" rel="noopener noreferrer"></a>
        </p>
      </footer>
    </>
  );
}

export default App;
