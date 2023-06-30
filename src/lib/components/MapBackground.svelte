<script lang="ts">
  export let size: number = 10000;
  export let rows: number = 1000;
  
  interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  let step = size / rows;

  let lines: Line[]  = [];
  for (let i = 0; i < rows; i++) {
    lines.push({
      x1: 0, x2: size,
      y1: i*step, y2: i*step
    })
    lines.push({
      y1: 0, y2: size,
      x1: i*step, x2: i*step
    })
  }
</script>

<svg
	width={size}
	height={size}
	style="background: #fefcaf;"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
>

	<!-- Horizontal Lines -->
  {#each lines as line}
     <line {...line} stroke="#00000020" stroke-width="1" />
  {/each}
</svg>
