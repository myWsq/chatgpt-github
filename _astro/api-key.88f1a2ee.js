import{c as s,o as c,m as l}from"./web.7ed5edc5.js";function i(t,a){const[r,o]=s(a);return c(()=>{const e=localStorage.getItem(t)?JSON.parse(localStorage.getItem(t)):a;o(()=>e)}),[r,e=>{const n=o(e);return localStorage.setItem(t,JSON.stringify(n)),n}]}const u=l(()=>{const t=i("__api_key__","");return{value:t[0],set:t[1]}});export{u as $};
