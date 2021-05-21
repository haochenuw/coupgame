<script>
    import io from "socket.io-client";
    // const socket = io();
    export let player1Id = ""; 
    export let player2Id = ""; 
    export let name;
    let gifs = [];
    let searchTerm = "";
    async function searchForGif(e) {
      try {
        const returnValue = await fetch(`/giphy?term=${searchTerm}`);
        const response = await returnValue.json();
        gifs = response.data;
      } catch (error) {
        console.error(error);
      }
    }
</script>
  
  <style>
  </style>
  
  <main>
    <h1>Your room code is {name}</h1>

    <ul>
        <li>
            Player1: {player1Id}
        </li>
        <li>
            Player2: {player2Id}
        </li>
    </ul>

    <div class="search-block">
      <input type="text" placeholder="Search for gif" bind:value={searchTerm} />
      <button on:click={searchForGif}>Search</button>
    </div>

    <div class="gifs">
      {#if gifs.length > 0}
        <div class="gifs-grid">
          {#each gifs as gif}
            <iframe src={gif.embed_url} title={gif.title} />
          {/each}
        </div>
      {:else}No gifs to show yet{/if}
    </div>
  </main>