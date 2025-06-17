<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Console, Documentation, Manufacturer } from '../../model/Console';
import { getFileProvider } from '@/Services/fileprovider';
import { getOntologyMapper } from '@/Services/ontologymapper';

export default defineComponent({
    name: 'ManufacturerView',
    setup() {
        const route = useRoute();
        const manufacturer = ref<Manufacturer | null>(null);
        const isLoading = ref(true);
        const fp = getFileProvider();
        const ontologyMapper = getOntologyMapper();
        const fileViewerUrl = ref<string | null>(null);
        const fileViewerText = ref<string | null>(null);

        onMounted(async () => {
            const manufacturerID = route.params.id as string;
            const manufacturerResult = (await ontologyMapper.getManufacturers()).find(
                (x) => x.identifier.toLowerCase() == manufacturerID.toLowerCase(),
            );

            if (manufacturerResult) {
                manufacturer.value = manufacturerResult;
            } else {
                console.error('Manufacturer not found for slug:', manufacturerID);
            }

            isLoading.value = false;
        });

        const handleGetFile = async (doc: Documentation) => {
            const link = doc.hasDocumentationLink;
            fileViewerText.value = null;
            fileViewerUrl.value = null;

            let response: Blob | string | undefined;
            let isTextFile = false;

            if (link.toLowerCase().startsWith('https://vgchontology.com/')) {
                response = await fp.tryGetOpenUrl(doc.identifier);
                if (response instanceof Blob && response.type.startsWith('text/')) {
                    isTextFile = true;
                }
            } else {
                response = link;
            }

            if (response instanceof Blob) {
                if (isTextFile) {
                    const text = await response.text();
                    fileViewerUrl.value = null;
                    fileViewerText.value = text;
                } else {
                    const fileUrl = URL.createObjectURL(response);
                    fileViewerUrl.value = fileUrl;
                    fileViewerText.value = null;
                }
            } else if (typeof response === 'string') {
                window.open(response);
            } else {
                alert('File not found');
            }
        };

        return { manufacturer, isLoading, handleGetFile, fileViewerUrl, fileViewerText };
    },
});
</script>

<template>
    <div v-if="isLoading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="manufacturer">
        <h1
            style="
                font-size: 3rem;
                display: flex;
                margin-bottom: 0%;
                justify-content: center;
                align-items: center;
            "
        >
            Manufacturer view
        </h1>

        <h1 style="margin-bottom: 0%">{{ manufacturer.name }}</h1>

        <div v-if="manufacturer.manufacturerType == 'Console' && manufacturer.hasCreatedConsoles">
            <section class="background-box">
                <h2>Consoles from {{ manufacturer.name }}:</h2>
                <ul>
                    <li
                        v-for="curConsole in [...manufacturer.hasCreatedConsoles].sort((a, b) =>
                            a.name.localeCompare(b.name),
                        )"
                        :key="curConsole.identifier"
                    >
                        <RouterLink :to="`/console/${curConsole.identifier}`">{{
                            curConsole.name
                        }}</RouterLink>
                    </li>
                </ul>
            </section>
        </div>
        <div
            v-else-if="
                manufacturer.manufacturerType === 'Component' && manufacturer.hasCreatedComponents
            "
        >
            <section class="background-box">
                <h2>Components from {{ manufacturer.name }}:</h2>
                <ul>
                    <li
                        v-for="curComponent in [...manufacturer.hasCreatedComponents].sort((a, b) =>
                            a.name.localeCompare(b.name),
                        )"
                        :key="curComponent.name"
                    >
                        <RouterLink :to="`/component/${curComponent.identifier}`"
                            >{{ curComponent.name }}
                            {{ curComponent.type ? `(${curComponent.type})` : `` }}</RouterLink
                        >
                    </li>
                </ul>
            </section>
        </div>
    </div>
    <div v-else>
        <h1>Manufacturer not found.</h1>
    </div>
</template>

<style scoped>
.txt-viewer {
    color-scheme: dark;
}

.console-view {
    font-family: Arial, sans-serif;
    line-height: 1.6;

    /* Added by copilot */
    width: 100vw;
    max-width: 100vw;
    margin: 0;
    padding: 0 2rem;
    box-sizing: border-box;
}

h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
}

h2 {
    font-size: 1.5em;
    margin-bottom: 1em;
}

section {
    margin-bottom: 2em;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 0.5em;
}

a {
    color: #007bff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

iframe {
    border: none;
}

button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #2c3239;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
}

button.active {
    background: #007bff;
    color: #ffffff;
    border-color: #007bff;
}
</style>
