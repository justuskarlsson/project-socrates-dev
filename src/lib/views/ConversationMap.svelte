<script lang="ts">
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import { connectFirestoreEmulator } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';

	let scaleLevel = 0;
	let scale = 1.0;
	let mapRoot: HTMLElement;
	let mapWorld: HTMLElement;
	let start = { x: 0, y: 0 };
	let scroll = { top: 5000, left: 5000 };
	let mousePos = { x: 0, y: 0 };

	function sendMessage(content: string) {}

	function onHighlight() {
		let selection = document.getSelection();
		let selectedText = selection?.toString();
		if (selectedText?.length) {
			// console.log(selectedText);
		}
	}

  let initOnChild = false;

	onMount(() => {
		document.addEventListener('selectionchange', onHighlight);
		scroll.top -= mapRoot.clientHeight / (2 * scale);
		scroll.left -= mapRoot.clientWidth / (2 * scale);
		mapRoot.scrollTop = scroll.top;
		mapRoot.scrollLeft = scroll.left;
	});

	onDestroy(() => {
		document.removeEventListener('selectionchange', onHighlight);
	});

	function onMouseDown(event: MouseEvent) {
    initOnChild = false;
		start = { x: event.clientX, y: event.clientY };
		if (!event.currentTarget) return;
		const currentTarget = event.currentTarget as HTMLElement;
		scroll = { top: currentTarget.scrollTop, left: currentTarget.scrollLeft };
		(event.currentTarget as HTMLElement).style.cursor = 'grabbing';
	}

	function onMouseMove(event: MouseEvent) {
		updateMousePosition(event.clientX, event.clientY);
		if (event.buttons !== 1 || initOnChild) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		mapRoot.scrollTop = scroll.top - dy;
		mapRoot.scrollLeft = scroll.left - dx;
	}

	function onMouseUp(event: MouseEvent) {
		(event.currentTarget as HTMLElement).style.cursor = 'grab';
	}

	function getTopLeft() {
		const { scrollTop, scrollLeft, offsetTop, offsetLeft } = mapRoot;
		return { x: scrollLeft - offsetLeft, y: scrollTop - offsetTop };
	}

	function updateMousePosition(dx = 0, dy = 0) {
		let tl = getTopLeft();
		mousePos.x = tl.x + dx / scale;
		mousePos.y = tl.y + dy / scale;
		// console.log(tl, mousePos);
	}

	function zoom(event: WheelEvent) {
		event.preventDefault();
		// velocity -> 1.0 straight to middle
		const v = 0.2;
		let delta = event.deltaY * -0.01;
		let { clientWidth, clientHeight } = mapRoot;
		let prevTl = getTopLeft();
		let prevCenter = {
			x: prevTl.x + clientWidth / (2 * scale),
			y: prevTl.y + clientHeight / (2 * scale)
		};
		let prevMousePos = mousePos;
		let prevScale = scale;
		scaleLevel += delta;
		let base = scaleLevel < 0 ? 1.12 : 1.25;
		scale = Math.pow(base, scaleLevel);
		let scaleChange = scale / prevScale;
		let newCenter = {
			x: v * mousePos.x + (1 - v) * prevCenter.x,
			y: v * mousePos.y + (1 - v) * prevCenter.y
		};
		let newTl = {
			x: newCenter.x - clientWidth / (2 * scale),
			y: newCenter.y - clientHeight / (2 * scale)
		};
		// console.log("\n", scale, getTopLeft(), mousePos);
		// console.log(prevScale, scale)
		mapWorld.style.transform = `scale(${scale})`;
		scroll.top = newTl.y;
		scroll.left = newTl.x;
		mapRoot.scrollTop = scroll.top;
		mapRoot.scrollLeft = scroll.left;
	}
  const None = (event: UIEvent) => { 
    event.stopPropagation();
    initOnChild = true;
  }
</script>

<!-- root to contain floating chatinput also -->
<div class="bg-gray-300 w-full h-full overflow-hidden">
  <!-- scrollable container of world -->
	<div
		class="cursor-grab overflow-scroll w-full h-full relative"
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseup={onMouseUp}
		on:wheel={zoom}
		bind:this={mapRoot}
	>
    <!-- whole world  -->
		<div class="bg-gray-100 w-[10000px] h-[10000px] absolute" 
          bind:this={mapWorld}>

      <!-- each message group -->
			<div class="shadow-xl p-4 border-2 absolute cursor-auto" 
          style="left:5000px; top:5000px;"
          on:mousedown={None}
          on:mouseup={None}
        >
        <!-- each message in group -->
				<ChatMessage content={"**Test message** \n\n\n $ x = 2 $\n"}/>
			</div>
		</div>
	</div>
	<div class="absolute bottom-6 w-full px-6">
		<ChatInput onSendMessage={sendMessage} />
	</div>
</div>

<style>
	/* Add custom scrollbar styles */
	::-webkit-scrollbar {
		width: 0px;
		height: 0px;
	}

	::-webkit-scrollbar-track {
		background-color: black;
		border-radius: 0px;
	}

	::-webkit-scrollbar-thumb {
		background-color: ghostwhite;
		border-radius: 4px;
		width: 40px;
		height: 40px;
	}
</style>
