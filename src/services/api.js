import axios from 'axios';

const API = axios.create({
  baseURL: 'https://tlapaleria-pos-production.up.railway.app', 
});

export default API;
