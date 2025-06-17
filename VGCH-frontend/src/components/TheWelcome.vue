<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue';
import DocumentationIcon from './icons/IconDocumentation.vue';
import ToolingIcon from './icons/IconTooling.vue';
import EcosystemIcon from './icons/IconEcosystem.vue';
import CommunityIcon from './icons/IconCommunity.vue';
import SupportIcon from './icons/IconSupport.vue';
</script>

<template>
    <WelcomeItem>
        <template #icon>
            <DocumentationIcon />
        </template>
        <template #heading>Documentation</template>

        VGCH provides console documentation. You can find the documentation for different consoles
        under the
        <RouterLink to="/visualizer">visualizer</RouterLink>. Here you can find different types of
        documents that provide helpful console information.
    </WelcomeItem>

    <WelcomeItem>
        <template #icon>
            <ToolingIcon />
        </template>
        <template #heading>Tooling</template>

        This project is based on linked data and an ontology. The ontology is for download
        <RouterLink to="/download">here</RouterLink>.
    </WelcomeItem>

    <WelcomeItem>
        <template #icon>
            <EcosystemIcon />
        </template>
        <template #heading>Ecosystem</template>

        The VGCH website and backend are completely free and open-source. The source code is
        available under the <RouterLink to="/download">downloads</RouterLink> section.
    </WelcomeItem>

    <WelcomeItem>
        <template #icon>
            <CommunityIcon />
        </template>
        <template #heading>Community</template>

        This website has been created by me (Yari). If you have any remarks on the
        ontology relations, structure or content, please make a <RouterLink to="/submission">submission</RouterLink>.
        If you just want to get in contact, please fill out the form on the
        <RouterLink to="/about">about</RouterLink> page.
    </WelcomeItem>

    <!-- <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Support Vue</template>

    As an independent project, Vue relies on community backing for its sustainability. You can help
    us by
    <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
  </WelcomeItem> -->
</template>

<style scoped>
:root {
    --color-background: #181a1b;
    --color-background-soft: #23272a;
    --color-background-mute: #222325;
    --color-border: #33383b;
    --color-border-hover: #444950;
    --color-heading: #fff;
    --color-text: #e0e0e0;
}

/* Make the welcome page wider by targeting the parent container */
:global(body) {
    background: var(--color-background);
}

:global(.content-wrapper) {
    max-width: 1800px;
    width: 100%;
    margin: 0 auto;
    padding: 0;
}
</style>
