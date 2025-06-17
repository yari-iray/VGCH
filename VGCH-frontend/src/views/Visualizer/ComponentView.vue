<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
// import { exampleConsoles } from './testconsoles';
import type { ComponentModel, Console, Documentation, Manufacturer } from '../../model/Console';
import { getFileProvider } from '@/Services/fileprovider';
import { getOntologyMapper } from '@/Services/ontologymapper';
import DocumentationGroups from '@/components/DocumentationGroups.vue';

export default defineComponent({
    name: 'ComponentView',
    components: { DocumentationGroups },
    setup() {
        const route = useRoute();
        const component = ref<ComponentModel | null>(null);
        const isLoading = ref(true);
        const fp = getFileProvider();
        const ontologyMapper = getOntologyMapper();
        const fileViewerUrl = ref<string | null>(null);
        const fileViewerText = ref<string | null>(null);
        const fileViewerMarkdown = ref<string | null>(null);

        onMounted(async () => {
            const componentID = route.params.id as string;
            const componentResult = (await ontologyMapper.getComponents([componentID])).at(0);

            if (componentResult) {
                component.value = componentResult;
            } else {
                console.error('Component not found for slug:', componentID);
            }

            isLoading.value = false;
        });

        const handleGetFile = async (doc: Documentation) => {
            const link = doc.hasDocumentationLink;
            fileViewerText.value = null;
            fileViewerUrl.value = null;
            fileViewerMarkdown.value = null;

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

        const handleFetchReadme = async (doc: Documentation) => {
            fileViewerMarkdown.value = null;
            fileViewerText.value = null;
            const link = doc.hasDocumentationLink.toLowerCase();
            if (!link.includes('https://github.com/')) {
                return;
            }
            const result = await fp.getGithubReadme(link);
            if (result) {
                fileViewerMarkdown.value = result;
            }
        };

        // Add a computed for groupedDocs if component.hasDocumentation exists
        const groupedDocs = computed(() => {
            if (!component.value || !component.value.hasDocumentation) return {};
            const groups: Record<string, Documentation[]> = {};
            for (const doc of component.value.hasDocumentation) {
                if (!groups[doc.type]) groups[doc.type] = [];
                groups[doc.type].push(doc);
            }
            return groups;
        });

        return {
            component,
            isLoading,
            handleGetFile,
            handleFetchReadme,
            fileViewerUrl,
            fileViewerText,
            fileViewerMarkdown,
            groupedDocs,
            DocumentationGroups,
        };
    },
});
</script>

<template>
    <div v-if="isLoading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="component">
        <h1
            style="
                font-size: 3rem;
                display: flex;
                margin-bottom: 0%;
                justify-content: center;
                align-items: center;
            "
        >
            Component view
        </h1>

        <h1 style="margin-bottom: 0%">{{ component.name }}</h1>

        <p
            v-if="component.manufacturer"
            style="margin-top: 0%; font-size: 1.3em; margin-bottom: 1em"
        >
            By
            <RouterLink :to="'/manufacturer/' + component.manufacturer.identifier">{{
                component.manufacturer.name
            }}</RouterLink>
        </p>

        <p style="margin-top: 0%; font-size: 1.3em; margin-bottom: 1em">
            Type: {{ component.type }}
        </p>

        <section class="background-box">
            <h2>Specifications:</h2>

            <ul>
                <li
                    v-for="spec in [...component.hasSpecification].sort((a, b) =>
                        a.localeCompare(b),
                    )"
                    :key="spec"
                >
                    {{ spec }}
                </li>
            </ul>
        </section>

        <section class="background-box">
            <h2>Documentation:</h2>
            <DocumentationGroups
                :grouped-docs="groupedDocs"
                :handle-get-file="handleGetFile"
                :handle-fetch-readme="handleFetchReadme"
            />

            <section v-if="!component.hasDocumentation?.length">
                No information available (<RouterLink to="/submission">Submission</RouterLink>)
            </section>
        </section>

        <section
            v-if="fileViewerUrl || fileViewerText || fileViewerMarkdown"
            class="background-box"
        >
            <h3>File Viewer:</h3>
            <template v-if="fileViewerMarkdown">
                <div
                    style="
                        background: #fff;
                        color: #000;
                        padding: 1rem;
                        border-radius: 4px;
                        max-height: 600px;
                        overflow: auto;
                    "
                    v-html="fileViewerMarkdown"
                ></div>
            </template>
            <template v-else-if="fileViewerText">
                <div
                    style="
                        white-space: pre-wrap;
                        background: #fff;
                        color: #000;
                        padding: 1rem;
                        border-radius: 4px;
                        max-height: 600px;
                        overflow: auto;
                    "
                >
                    {{ fileViewerText }}
                </div>
            </template>
            <template v-else>
                <iframe
                    v-if="fileViewerUrl"
                    :src="fileViewerUrl || undefined"
                    width="100%"
                    height="600px"
                    frameborder="0"
                ></iframe>
            </template>
            <button
                @click="
                    fileViewerUrl = null;
                    fileViewerText = null;
                    fileViewerMarkdown = null;
                "
                style="margin-top: 1rem"
            >
                Close File Viewer
            </button>
        </section>

        <section class="background-box" v-if="component.isComponentOf">
            <h2>Is a component of:</h2>

            <ul>
                <li
                    v-for="curConsole in [...component.isComponentOf].sort((a, b) =>
                        a.name.localeCompare(b.name),
                    )"
                    :key="curConsole.name"
                >
                    <RouterLink :to="`/console/${curConsole.identifier}`">{{
                        curConsole.name
                    }}</RouterLink>
                </li>
            </ul>
        </section>
    </div>
    <div v-else>
        <h1>Component not found.</h1>
    </div>
</template>

<style scoped>
.txt-viewer {
    color-scheme: dark;
}

.console-view {
    font-family: Arial, sans-serif;
    line-height: 1.6;
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
