/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  env: {
    urlfront: process.env.NODE_ENV === 'production' ? 'http://desarrolloypruebas.com.ar:2001' : 'http://localhost:3000',
    urlback: process.env.NODE_ENV === 'production' ? 'http://desarrolloypruebas.com.ar:2003' : 'http://localhost:2003',
    urlmiddleware: process.env.NODE_ENV === 'production' ? 'http://backend-pdp' : 'http://localhost:2003',
    cli: 'd361f91377b3a8ad8b132f5b2fab1e2746a5f06c',
    aes_secret: "GC8bxHUnyY7mfLQUuTtgViWMsVT4LyPJ",
    aes_iv: "1011121314151e1f",
    method_id_360: 2,
    method_id_macro_click: 1,
    method_id_e_pagos: 3
  }
}

module.exports = nextConfig