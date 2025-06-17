<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Documentation } from '../model/Console';

export default defineComponent({
    name: 'DocumentationGroups',
    props: {
        groupedDocs: {
            type: Object as PropType<Record<string, Documentation[]>>,
            required: true,
        },
        handleGetFile: {
            type: Function as PropType<(doc: Documentation) => void>,
            required: true,
        },
        handleFetchReadme: {
            type: Function as PropType<(doc: Documentation) => void>,
            required: true,
        },
    },
});
</script>

<template>
    <div>
        <div v-for="(docs, docType) in groupedDocs" :key="docType" class="doc-group">
            <h3 class="doc-type-heading">{{ docType }}</h3>
            <ul>
                <li v-for="doc in docs" :key="doc.hasDisplayName">
                    <strong>{{ doc.hasDisplayName }}</strong
                    >:
                    <a
                        :href="
                            doc.hasDocumentationLink
                                .toLowerCase()
                                .startsWith('https://vgchontology.com/')
                                ? 'javascript:void(0)'
                                : doc.hasDocumentationLink
                        "
                        @click.prevent="handleGetFile(doc)"
                        target="_blank"
                    >
                        {{
                            doc.hasDocumentationLink.toLowerCase().includes('https://github.com')
                                ? 'GitHub'
                                : doc.hasDocumentationLink
                                        .toLowerCase()
                                        .startsWith('https://vgchontology.com/')
                                  ? 'Open document'
                                  : 'Link'
                        }}
                    </a>
                    <a
                        v-if="doc.hasDocumentationSource"
                        target="_blank"
                        :href="doc.hasDocumentationSource"
                        style="margin-left: 5px"
                    >
                        Source
                    </a>
                    <a
                        :href="'javascript:void(0)'"
                        v-if="doc.hasDocumentationLink.toLowerCase().includes('https://github.com')"
                        @click.prevent="handleFetchReadme(doc)"
                        style="margin-left: 5px"
                        >Open README.md</a
                    >
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
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
