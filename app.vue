<script lang="ts">
const current = new Date();
const current_year = `${current.getFullYear()}`;

export default {
  data() {
    return {
      my_date: current_year
    }
  }
}


</script>
<template>
<div class="container mx-auto">
  <div class="navbar bg-base-100">
    <div class="flex-1">
      <a class="btn btn-ghost normal-case text-xl">Brian Redfern</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><a href="mailto://brianwredfern@gmail.com">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="hero min-h-screen bg-base-200" style="background-image: url(/images/ifive.jpg);">
    <div class="hero-content flex-col lg:flex-row" style="background-color: azure;">
      <img src="/images/redfern.jpg" class="max-w-xs rounded-lg shadow-2xl" />
      <div>
        <p class="py-6"><ContentDoc /></p>
      </div>
    </div>
  </div>
  <footer class="footer footer-center p-4 bg-base-300 text-base-content">
  <div>
    <p>Copyright © {{ my_date }} - All right reserved by Brian Redfern</p>
  </div>
</footer>
</div>
</template>
