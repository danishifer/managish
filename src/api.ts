import { Platform } from 'react-native';
import axios from 'axios';
import { Buffer } from 'buffer/';
import { BASE_URL } from './constants';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 4, retryDelay: (retryCount) => {
  return retryCount * 1000;
}});


export interface PlaceSuggestion {
  category: string,
  categoryTitle: string,
  distance: number,
  highlightedTitle: string,
  highlightedVicinity: string,
  href: string,
  id: string,
  position: [number, number],
  resultType: string,
  title: string,
  type: string,
  vicinity: string,
}

export interface PlaceType {
  id: string,
  type: {
    name: string,
    icon: string
  }
}

export interface Profile {
  name: string,
  picture: string
}

export interface Place {
  features: string[],
  id: string,
  location: {
    house?: string,
    street?: string,
    city: string,
    country: string,
    postalCode: string,
    coordinates: {
      lat: string,
      long: string
    }
  },
  name: string,
  type: string,
  votes: {
    positive: string[],
    negative: string[]
  },
  reviews: string[]
}

class API {

  private profiles = [];
  private places = [];
  private token = "";

  config = (token: string) => {
    this.token = token;
    axios.defaults.headers = {
      "Authorization": "Bearer " + token
    }
    axios.defaults.baseURL = BASE_URL
  }

  fetchProfile = (id: string): Promise<any> => {
    console.log('fetching profile with id :', id);
    return new Promise((resolve, reject) => {
      if (this.profiles.includes(id)) return resolve();
      
      this.profiles.push(id);

      axios.get(`/profile/${id}`)
        .then(res => {
          resolve({ id, ...res.data });
        }).catch(err => {
          reject(err);
        })
    });
  }

  fetchPlace = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (this.places.includes(id)) return resolve();

      this.places.push(id);

      axios.get(`/places/${id}`)
        .then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err)
        })
    })

  }
  
  fetchPlaceTypes = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      axios.get('/types/places')
        .then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err);
        })
    })
  }

  fetchFeatureTypes = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      axios.get('/types/features')
        .then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err);
        })
    })
  }

  fetchPicture = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!id) return resolve();

      axios.get(`/media/photo?filename=${id}`, {
        responseType: "arraybuffer"
      })
        .then(res => {
          let image = new Buffer(res.data, 'binary').toString('base64');
          resolve({ id, photo: image });
        }).catch(err => {
          reject(err)
        })
    })
  }

  uploadProfilePicture = (picture: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      let data = new FormData();
      data.append('photo', {
        // @ts-ignore
        uri: picture,
        type: "image/jpeg",
        name: 'photo'
      })
      fetch(BASE_URL + '/profile-picture', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + this.token
        }
      })
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
    })
  }

  getPicture = (id: string) => {

  }

  placeAutosuggest = (q: string) => {
    return new Promise<PlaceSuggestion>((resolve, reject) => {
      axios.get(`/autosuggest`, {
        baseURL: 'https://places.cit.api.here.com/places/v1',
        params: {
          app_id: '5Z2llOoIpn3VnViTdzfK',
          app_code: 'QrCKDZZCxNX4-yyjQDBF4w',
          at: '31.3297513,34.1874335',
          addressFilter: 'countryCode=ISR',
          result_types: 'place',
          tf: 'plain',
          q
        },
        headers: {
          'Accept-Language': 'he-IL'
        }
      })
        .then(res => {
          resolve(res.data.results)
        }).catch(err => {
          reject(err);
        })
    })
  }

  getReviewPlace = (placeId: string) => {
    return new Promise((resolve, reject) => {
      // TODO Caching
      // if (this.places.includes(id)) return resolve();

      // this.places.push(id);

      axios.get(`/places/${placeId}`, {
        validateStatus: null
      })
        .then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err)
        })
    })
  }

  postReview = (placeId: string, text: string, photo?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      let data = new FormData();

      if (photo) {
        data.append('photo', {
          // @ts-ignore
          uri: photo.path,
          name: 'image.jpg',
          type: 'multipart/form-data'
        });
      }

      data.append('placeId', placeId);
      data.append('text', text)
      

      axios.put('/reviews', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  }

  addPlace = (placeId: string, placeType: string, name: string, location: string, features: string[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      axios.put(`/places?placeId=${placeId}&placeType=${placeType}`, {
        name,
        location,
        features
      })
        .then(res => {
          resolve(res.data);
        }).catch(err => {
          reject(err);
        })
    })
  }

  votePlaceFeatures = (placeId: string, features: string[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      axios.post(`/places/${placeId}/features`, {
        features
      }).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  }

  search = (query: string, type?: string, features?: string[]) => {
    let data: any = { query }

    if (type) {
      data.type = type;
    }
    if (features && features.length > 0) {
      data.features = features;
    }

    return new Promise((resolve, reject) => {
      axios.post('/search/places', data).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  }

  fetchReview = (reviewId: string) => {
    return new Promise((resolve, reject) => {
      axios.get(`/reviews/${reviewId}`, {
        validateStatus: null
      })
        .then(res => {
          if (res.status === 200) {
            resolve(res.data);
          } else {
            resolve();
          }
        }).catch(err => {
          reject(err);
        })
    })
  }

  fetchStatus = () => {
    return new Promise((resolve, reject) => {
      const statusType = Platform.OS === 'ios' ? 'ios' : 'android';

      axios.get(`/status/${statusType}`)
        .then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err);
        })
    })
  }
}

export default new API();