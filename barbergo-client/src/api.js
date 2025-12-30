import axios from 'axios';

// helper: convert plain objects (including nested) to FormData
function buildFormData(obj, form = new FormData(), parentKey = null) {
  if (obj === undefined || obj === null) return form;

  if (obj instanceof Date) {
    form.append(parentKey, obj.toISOString());
    return form;
  }

  if (obj instanceof File || obj instanceof Blob) {
    form.append(parentKey, obj);
    return form;
  }

  if (typeof obj !== 'object' || obj instanceof FormData) {
    if (parentKey) form.append(parentKey, obj);
    return form;
  }

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      // append arrays as repeated fields
      value.forEach((v, i) => {
        if (v instanceof File || v instanceof Blob) {
          form.append(`${formKey}[]`, v);
        } else if (typeof v === 'object') {
          buildFormData(v, form, `${formKey}[${i}]`);
        } else {
          form.append(`${formKey}[]`, v);
        }
      });
    } else if (value instanceof File || value instanceof Blob) {
      form.append(formKey, value);
    } else if (typeof value === 'object') {
      buildFormData(value, form, formKey);
    } else {
      form.append(formKey, value);
    }
  });

  return form;
}

export function createApi({
  baseURL = 'http://localhost:8000/api/v1',
  withCredentials = true,
  defaultHeaders = {},
} = {}) {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...defaultHeaders,
    },
    withCredentials,
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Per-request flag: if `config.isMultipart` is true, convert data to FormData
    if (config.isMultipart) {
      if (!(config.data instanceof FormData)) {
        config.data = buildFormData(config.data || {});
      }
    } else {
      // Ensure a JSON content type when not multipart and data exists
      if (config.data && !(config.data instanceof FormData)) {
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  });

  return instance;
}

// default instance (backwards compatible)
const api = createApi();

export default api;
