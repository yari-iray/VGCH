<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { getOntologyMapper as getOntologyMapper } from '@/Services/ontologymapper';
import type { Console } from '@/model/Console';
import { RecentConsolesHandler } from '@/Services/recentconsoleshandler';
import type { Manufacturer, ComponentModel } from '@/model/Console';

const router = useRouter();
const ontologyMapper = getOntologyMapper();
const recentConsolesHandler = new RecentConsolesHandler();

const allConsoles = ref<Console[]>([]);
const recentConsoles = ref<Console[]>([]);
const activeTab = ref<'consoles' | 'manufacturers' | 'components'>('consoles');
const allManufacturers = ref<Manufacturer[]>([]);
const allComponents = ref<ComponentModel[]>([]);

const visitConsole = (curConsole: Console) => {
    recentConsoles.value = recentConsoles.value.filter(
        (c) => c.identifier !== curConsole.identifier,
    );

    recentConsoles.value.unshift(curConsole);
    recentConsoles.value.length = Math.min(recentConsoles.value.length, 3);

    recentConsolesHandler.saveRecentConsoles(recentConsoles.value);
    router.push(`/console/${curConsole.identifier}`);
};

onMounted(async () => {
    allConsoles.value = await ontologyMapper.getConsoles();
    recentConsoles.value = recentConsolesHandler.loadRecentConsoles(allConsoles.value);
    allManufacturers.value = await ontologyMapper.getManufacturers();
    // Collect all unique component IRIs from all consoles
    const componentIRIs = Array.from(
        new Set(
            allConsoles.value.flatMap((c) => c.hasComponents?.map((comp) => comp.identifier) || []),
        ),
    );
    if (componentIRIs.length) {
        allComponents.value = (await ontologyMapper.getComponents(componentIRIs)).filter(
            Boolean,
        ) as ComponentModel[];
    }
});

const searchQuery = ref('');
const consolesSortBy = ref<'manufacturer' | 'name'>('name');

// Computed properties
const sortedConsoles = computed(() => {
    return [...allConsoles.value].sort((a, b) => {
        if (consolesSortBy.value == 'manufacturer') {
            return a.isCreatedBy.name.localeCompare(b.isCreatedBy.name);
        } else if (consolesSortBy.value == 'name') {
            return a.name.localeCompare(b.name);
        }
        throw new Error();
    });
});

const filteredSuggestions = computed(() => {
    if (searchQuery.value.length < 3) return [];
    const query = searchQuery.value.toLowerCase();
    return sortedConsoles.value.filter(
        (curConsole) =>
            curConsole.name.toLowerCase().includes(query) ||
            curConsole.isCreatedBy.name.toLowerCase().includes(query),
    );
});

const filteredConsoles = computed(() => {
    return searchQuery.value.length < 3 ? sortedConsoles.value : filteredSuggestions.value;
});

// Methods
const setSort = (method: 'manufacturer' | 'name') => {
    consolesSortBy.value = method;
};

const manufacturerSearchQuery = ref('');
const manufacturerSortBy = ref<'name' | 'type'>('name');
const componentSearchQuery = ref('');
const componentSortBy = ref<'name' | 'type'>('name');

const sortedManufacturers = computed(() => {
    return [...allManufacturers.value].sort((a, b) => {
        if (manufacturerSortBy.value === 'type') {
            return a.manufacturerType.localeCompare(b.manufacturerType);
        } else {
            return a.name.localeCompare(b.name);
        }
    });
});
const filteredManufacturers = computed(() => {
    if (manufacturerSearchQuery.value.length < 3) return sortedManufacturers.value;
    const query = manufacturerSearchQuery.value.toLowerCase();
    return sortedManufacturers.value.filter(
        (m) =>
            m.name.toLowerCase().includes(query) ||
            m.manufacturerType.toLowerCase().includes(query),
    );
});

const sortedComponents = computed(() => {
    return [...allComponents.value].sort((a, b) => {
        if (componentSortBy.value === 'type') {
            return a.type.localeCompare(b.type);
        } else {
            return (a.name || a.identifier).localeCompare(b.name || b.identifier);
        }
    });
});
const filteredComponents = computed(() => {
    if (componentSearchQuery.value.length < 3) return sortedComponents.value;
    const query = componentSearchQuery.value.toLowerCase();
    return sortedComponents.value.filter(
        (c) =>
            (c.name || c.identifier).toLowerCase().includes(query) ||
            c.type.toLowerCase().includes(query),
    );
});
</script>

<template>
    <h1>Visualizer</h1>
    <div class="registry-view">
        <div class="tab-bar">
            <button :class="{ active: activeTab === 'consoles' }" @click="activeTab = 'consoles'">
                Consoles
            </button>
            <button
                :class="{ active: activeTab === 'manufacturers' }"
                @click="activeTab = 'manufacturers'"
            >
                Manufacturers
            </button>
            <button
                :class="{ active: activeTab === 'components' }"
                @click="activeTab = 'components'"
            >
                Components
            </button>
        </div>
        <div v-if="activeTab === 'consoles'">
            <div class="search-section">
                <input
                    class="search-box"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search consoles..."
                />
            </div>
            <div class="controls">
                <button @click="setSort('name')" :class="{ active: consolesSortBy === 'name' }">
                    Sort by Name
                </button>
                <button
                    @click="setSort('manufacturer')"
                    :class="{ active: consolesSortBy === 'manufacturer' }"
                >
                    Sort by Manufacturer
                </button>
            </div>
            <div class="console-list">
                <div
                    v-for="curConsole in filteredConsoles"
                    :key="curConsole.identifier"
                    class="console-item"
                >
                    <a href="#" @click.prevent="visitConsole(curConsole)">
                        <span class="first-name">{{ curConsole.name }}</span>
                    </a>
                    <div class="manufacturer-type">{{ curConsole.isCreatedBy.name }}</div>
                </div>
            </div>
            <div v-if="recentConsoles.length" class="recent-section">
                <h3>Recently Visited</h3>
                <ul class="recent-list">
                    <li v-for="c in recentConsoles" :key="c.identifier">
                        <a href="#" @click.prevent="visitConsole(c)">{{ c.name }} </a>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else-if="activeTab === 'manufacturers'">
            <div class="search-section">
                <input
                    class="search-box"
                    v-model="manufacturerSearchQuery"
                    type="text"
                    placeholder="Search manufacturers..."
                />
            </div>
            <div class="controls">
                <button
                    @click="manufacturerSortBy = 'name'"
                    :class="{ active: manufacturerSortBy === 'name' }"
                >
                    Sort by Name
                </button>
                <button
                    @click="manufacturerSortBy = 'type'"
                    :class="{ active: manufacturerSortBy === 'type' }"
                >
                    Sort by Type
                </button>
            </div>
            <div class="manufacturer-list">
                <div
                    v-for="manufacturer in filteredManufacturers"
                    :key="manufacturer.identifier"
                    class="manufacturer-item"
                >
                    <RouterLink :to="`/manufacturer/${manufacturer.identifier}`">
                        <span class="first-name">{{ manufacturer.name }}</span>
                    </RouterLink>
                    <div class="manufacturer-type">
                        {{ manufacturer.manufacturerType }} manufacturer
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="activeTab === 'components'">
            <div class="search-section">
                <input
                    class="search-box"
                    v-model="componentSearchQuery"
                    type="text"
                    placeholder="Search components..."
                />
            </div>
            <div class="controls">
                <button
                    @click="componentSortBy = 'name'"
                    :class="{ active: componentSortBy === 'name' }"
                >
                    Sort by Name
                </button>
                <button
                    @click="componentSortBy = 'type'"
                    :class="{ active: componentSortBy === 'type' }"
                >
                    Sort by Type
                </button>
            </div>
            <div class="component-list">
                <div
                    v-for="component in filteredComponents"
                    :key="component.identifier"
                    class="component-item"
                >
                    <RouterLink :to="`/component/${component.identifier}`">
                        <span class="first-name">{{ component.name || component.identifier }}</span>
                    </RouterLink>
                    <div class="component-type">{{ component.type }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.registry-view {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.tab-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.tab-bar button {
    flex: 1;
    padding: 1rem;
    background: #2c3239;
    color: #fff;
    border: 1px solid #ffffff;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: large;
}

.tab-bar button.active {
    background: #007bff;
    color: #ffffff;
}

.tab-bar button:hover {
    background: #0056b3;
}

.recent-section {
    margin-top: 2rem;
    background: #23272a;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    color: var(--color-text);
}
.recent-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}
.recent-list li a {
    color: #fff;
    text-decoration: underline;
    cursor: pointer;
}
.recent-list li a:hover {
    color: #007bff;
}

.search-box {
    background: #333;
    color: white;
    border-color: rgb(163, 163, 163);
}

.search-section {
    position: relative;
    margin-bottom: 2rem;
}

input {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    border: 2px solid #ccc;
    border-radius: 4px;
}

.suggestions {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #eee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.suggestion-item {
    display: block;
    padding: 0.8rem;
    text-decoration: none;
    color: #333;
    border-color: rgb(163, 163, 163);
}

.suggestion-item:hover {
    background: #f5f5f5;
}

.controls {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
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

button.hover {
    background: #0056b3;
}

.console-list {
    display: grid;
    gap: 1.5rem;
}

h1 {
    font-size: 3rem;
    display: flex;
    margin-bottom: 0%;
    margin-top: 0%;
    justify-content: center;
    align-items: center;
}

.console-item {
    padding: 1.5rem;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #363c41;
    transition: transform 0.2s;
}

.console-item:hover {
    transform: translateY(-2px);
}

.first-name {
    font-weight: bold;
    color: #007bff;
}

.last-name {
    font-weight: bold;
    color: #ffffff;
}

.console-role {
    font-style: italic;
    color: #666;
    margin-bottom: 0.5rem;
}

.console-description {
    color: #ffffff;
    line-height: 1.5;
}

.manufacturer-list,
.component-list {
    display: grid;
    gap: 1.5rem;
}

.manufacturer-item,
.component-item {
    padding: 1.5rem;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #363c41;
    transition: transform 0.2s;
}

.manufacturer-item:hover,
.component-item:hover {
    transform: translateY(-2px);
}

.manufacturer-type,
.component-type {
    font-style: italic;
    color: #666;
}
</style>
