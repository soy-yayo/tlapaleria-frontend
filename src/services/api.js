import axios from 'axios';

const API = axios.create({
  baseURL: 'tlapaleria-pos-production.up.railway.app', 
});

export default API;
