<script setup lang="ts">
import { getFileProvider } from '@/Services/fileprovider';

const handleDownload = async (e: MouseEvent) => {
    e.preventDefault();
    const fp = getFileProvider();
    const response = await fp.tryGetOpenUrl('ontology.turtle', false);

    if (response) {
        const fileUrl = URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'ontology.turtle';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);
    } else {
        alert(`Cannot download the ontology`);
    }
};
</script>

<template>
    <main>
        <div class="ontology">
            <h1>Downloads</h1>
        </div>

        <div class="background-box">
            <h2>Ontology</h2>

            <div>
                <p class="pgSpace">
                    The ontology is available for download
                    <a href="javascript:void(0)" v-on:click="handleDownload">here</a>
                </p>
            </div>
        </div>

        <div class="background-box">
            <h2>Source code</h2>

            <div class="source code">
                <div>
                    <p class="pgSpace">
                        The source code is available on
                        <a href="https://github.com/yari-iray/VGCH-ontology" target="_blank"
                            >Github</a
                        >
                    </p>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
}

h2 {
    font-size: 2rem;
}

h3 {
    font-size: 1.2rem;
}

button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

label {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: var(--color-heading);
}

.pgSpace {
    margin-top: 3%;
    margin-bottom: 3%;
}

.greetings h1,
.greetings h3 {
    text-align: center;
}
</style>
