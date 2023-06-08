<script lang="ts">
  import GiCardDraw from 'svelte-icons/gi/GiCardDraw.svelte'
</script>

<div>


  

  <span class="x-icon group">
    <GiCardDraw />
    <span class="x-icon-tooltip group-hover:scale-100">
      Flashcards
    </span>
  </span>
</div>

<nav class="bg-gray-800 px-2 h-16 flex-x">
  <div class="flex-x space-x-4">
    <a href="#" class="x-link x-link-active">Dashboard</a>
    <a href="#" class="x-link">Team</a>
    <a href="#" class="x-link">Projects</a>
    <a href="#" class="x-link">Calendar</a>
  </div>
</nav>

<div class="grid grid-cols-10">
  <span class="col-span-10 h-12  bg-slate-600"></span>
  <span class="col-span-3 h-[calc(100vh-3rem)] bg-slate-100"></span>
  <span class="col-span-7 h-[calc(100vh-3rem)]  bg-slate-400"></span>
</div>