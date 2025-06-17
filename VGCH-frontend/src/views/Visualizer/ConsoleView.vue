<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { Console, Documentation } from '../../model/Console';
import { getFileProvider } from '@/Services/fileprovider';
import { getOntologyMapper } from '@/Services/ontologymapper';
import DocumentationGroups from '@/components/DocumentationGroups.vue';

export default defineComponent({
    name: 'ConsoleView',
    components: {
        DocumentationGroups,
    },
    setup() {
        const route = useRoute();
        const curConsole = ref<Console | null>(null);
        const isLoading = ref(true);
        const fp = getFileProvider();
        const ontologyMapper = getOntologyMapper();
        const fileViewerUrl = ref<string | null>(null);
        const fileViewerText = ref<string | null>(null);
        const fileViewerMarkdown = ref<string | null>(null);

        // Refetch console when route changes
        const fetchConsole = async (consoleID: string) => {
            isLoading.value = true;
            const consoleResult = (await ontologyMapper.getConsoles([consoleID])).at(0);
            if (consoleResult) {
                curConsole.value = consoleResult;

                console.log(consoleResult.hasComponents);
            } else {
                curConsole.value = null;
                console.error('Console not found for slug:', consoleID);
            }
            isLoading.value = false;
        };

        onMounted(async () => {
            await fetchConsole(route.params.id as string);
        });

        // Watch for route changes (e.g., when clicking successor/predecessor)
        watch(
            () => route.params.id,
            async (newId, oldId) => {
                if (newId && newId !== oldId) {
                    await fetchConsole(newId as string);
                }
            },
        );

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

        const groupedDocs = computed(() => {
            if (!curConsole.value) return {};
            const groups: Record<string, Documentation[]> = {};
            for (const doc of curConsole.value.hasDocumentation) {
                if (!groups[doc.type]) groups[doc.type] = [];
                groups[doc.type].push(doc);
            }
            return groups;
        });

        return {
            curConsole,
            isLoading,
            handleGetFile,
            fileViewerUrl,
            fileViewerText,
            handleFetchReadme,
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
    <div v-else-if="curConsole">
        <h1
            style="
                font-size: 3rem;
                display: flex;
                margin-bottom: 1%;
                justify-content: center;
                align-items: center;
            "
        >
            Console documentation
        </h1>

        <h1 style="margin-bottom: 0%">{{ curConsole.name }}</h1>
        <p style="margin-top: 0%; font-size: 1.3em; margin-bottom: 1em">
            By
            <RouterLink :to="'/manufacturer/' + curConsole.isCreatedBy.identifier">{{
                curConsole.isCreatedBy.name
            }}</RouterLink>
        </p>

        <div v-if="curConsole.isSuccessorOf">
            <p style="margin-top: 0%; font-size: 1.3em; margin-bottom: 1em">
                Preceded by:
                <RouterLink :to="'/console/' + curConsole.isSuccessorOf.identifier">{{
                    curConsole.isSuccessorOf.name
                }}</RouterLink>
            </p>
        </div>

        <div v-if="curConsole.hasSuccessor">
            <p style="margin-top: 0%; font-size: 1.3em; margin-bottom: 1em">
                Succeeded by:
                <RouterLink :to="'/console/' + curConsole.hasSuccessor.identifier">{{
                    curConsole.hasSuccessor.name
                }}</RouterLink>
            </p>
        </div>

        <nav class="legend-nav background-box">
            <span class="legend-label">Go to:</span>
            <a v-if="curConsole.hasReleaseDate?.length" href="#release-dates">Release Dates</a>
            <a href="#summary">Summary</a>
            <a href="#details">Details</a>
            <a v-if="curConsole.hasComponents?.length" href="#components">Components</a>
            <a v-if="curConsole.hasSpecifications?.length" href="#specifications">Specifications</a>
            <a href="#documentation">Documentation</a>
            <a v-if="fileViewerUrl || fileViewerText || fileViewerMarkdown" href="#file-viewer"
                >File Viewer</a
            >
        </nav>

        <section v-if="curConsole.hasReleaseDate?.length" class="background-box" id="release-dates">
            <h2>Release Dates:</h2>
            <ul>
                <li v-for="release in curConsole.hasReleaseDate" :key="release.hasRegion">
                    {{ release.hasRegion }}: {{ release.hasDate.toLocaleDateString() }}
                </li>
            </ul>
        </section>

        <section id="summary">
            <div class="background-box">
                <h2>Summary:</h2>
                <div v-html="curConsole.summary ? curConsole.summary : 'No summary available'"></div>
            </div>
        </section>

        <section id="details">
            <div class="background-box">
                <h2>Details:</h2>
                <div
                    v-html="
                        curConsole.description ? curConsole.description : 'No details available'
                    "
                ></div>
            </div>
        </section>

        <div v-if="curConsole.hasComponents?.length">
            <section class="background-box" id="components">
                <h2>Components:</h2>

                <ul>
                    <li
                        v-for="comp in [...curConsole.hasComponents].sort((a, b) =>
                            a.name.localeCompare(b.name),
                        )"
                        :key="comp.name"
                    >
                        {{ comp.type }}:
                        <RouterLink :to="`/component/${comp.identifier}`">{{
                            comp.name
                        }}</RouterLink>
                    </li>
                </ul>
            </section>
        </div>

        <div v-if="curConsole.hasSpecifications?.length">
            <section class="background-box" id="specifications">
                <h2>Specifications:</h2>

                <ul>
                    <li
                        v-for="spec in [...curConsole.hasSpecifications].sort((a, b) =>
                            a.localeCompare(b),
                        )"
                        :key="spec"
                    >
                        {{ spec }}
                    </li>
                </ul>
            </section>
        </div>

        <section class="background-box" id="documentation">
            <h2>Documentation:</h2>
            <DocumentationGroups
                :grouped-docs="groupedDocs"
                :handle-get-file="handleGetFile"
                :handle-fetch-readme="handleFetchReadme"
            />
            <section v-if="!curConsole.hasDocumentation.find((x) => x.type.includes('Schematic'))">
                Schematic: No information available (<RouterLink to="/submission"
                    >Submission</RouterLink
                >)
            </section>
            <section v-if="!curConsole.hasDocumentation.find((x) => x.type.includes('Test'))">
                HardwareTest: No information available (<RouterLink to="/submission"
                    >Submission</RouterLink
                >)
            </section>
        </section>

        <section v-if="fileViewerUrl || fileViewerText || fileViewerMarkdown" id="file-viewer">
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

        <section class="background-box" id="submission" style="margin-top: 10%">
            <h2>Submission</h2>

            <p>
                If any information on this page is missing or incorrect, or you can provide missing
                information, please create a <RouterLink to="/submission">submission</RouterLink>
            </p>
        </section>
    </div>
    <div v-else>
        <h1>Console not found.</h1>
    </div>
</template>

<style scoped>
.legend-nav {
    display: flex;
    gap: 1.2rem;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0.7rem 1.2rem;
    font-size: 1.1em;
    background: #23272a;
    border-radius: 12px;
    color: var(--color-text);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.legend-label {
    font-weight: bold;
    font-size: 1.1rem;
    margin-right: 0.7rem;
}
.legend-nav a {
    color: #7ecfff;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;
}
.legend-nav a:hover {
    color: #fff;
}

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

.doc-group {
    margin-bottom: 1.5em;
    padding-bottom: 1em;
    border-bottom: 1px solid #444;
}
.doc-type-heading {
    font-size: 1.2em;
    color: #7ecfff;
    margin-bottom: 0.5em;
    margin-top: 0.5em;
}
</style>
