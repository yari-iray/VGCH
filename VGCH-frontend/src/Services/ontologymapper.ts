import * as rdf from 'rdflib';
import { TypedVGCH as Ont } from './typedVgch';

import type { Quad_Subject } from 'rdflib/lib/tf-types';
import { getFileProvider } from './fileprovider';
import type {
    ComponentModel,
    Console,
    Documentation,
    Manufacturer,
    ReleaseDate,
} from '@/model/Console';

// NAMESPACES
const VGCH = rdf.Namespace('https://VGCHontology.com/Entities/');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

class OntologyMapper {
    store: rdf.Store | undefined = undefined;

    async getConsoles(filterIdentifiers?: string[]): Promise<Console[]> {
        let Store = this.store;

        if (!Store) {
            Store = await this._initializeOntology();
        }

        const fetchConsole = (
            subject: Quad_Subject,
            recurse: boolean = true,
        ): Console | undefined => {
            if (!subject) return undefined;

            const type = Store.anyValue(subject, RDF('type'), undefined) ?? '';
            const hasDisplayName = Store.anyValue(subject, Ont.hasDisplayName, undefined) ?? '';
            const isCreatedByID = Store.match(subject, Ont.isCreatedBy, undefined)[0];

            const createdByNode = rdf.sym(isCreatedByID.object.value);
            const isCreatedBy: Manufacturer = {
                name: Store.anyValue(createdByNode, Ont.hasDisplayName, undefined) ?? '',
                uri: createdByNode.value,
                hasCreatedIDs: Store.match(createdByNode, Ont.hasCreated, undefined).map(
                    (x) => x.object.value,
                ),
                manufacturerType: 'Console',
                identifier: isCreatedByID.object.value.split('/').at(-1)!,
            };

            // Documentation
            let hasDocumentation: Documentation[] = [];
            const docMatches = Store.match(subject, Ont.hasDocumentation, undefined);
            if (docMatches.length > 0) {
                hasDocumentation = docMatches.map((d) => {
                    const docNode = rdf.sym(d.object.value);
                    const docTypes = Store.match(docNode, RDF('type'), undefined).filter(
                        (x) => !x.object.value.includes('NamedIndividual'),
                    );

                    const docType =
                        docTypes.find((x) => !x.object.value.includes('Documentation')) ??
                        docTypes.at(0);

                    return {
                        type:
                            docType?.object.value.replace(
                                'https://VGCHontology.com/Entities/',
                                '',
                            ) ?? '',
                        hasDisplayName:
                            Store.anyValue(docNode, Ont.hasDisplayName, undefined) ?? '',
                        hasDocumentationLink:
                            Store.anyValue(docNode, Ont.hasDocumentationLink, undefined) ?? '',
                        hasDocumentationSource:
                            Store.anyValue(docNode, Ont.hasDocumentationSource, undefined) ?? '',
                        isDocumentationOf:
                            Store.anyValue(docNode, Ont.isDocumentationOf, undefined) ?? '',
                        identifier: d.object.value.split('/').at(-1)!,
                    };
                });
            }

            // Release Dates
            let hasReleaseDate: ReleaseDate[] = [];
            const releaseDateMatches = Store.match(subject, Ont.hasReleaseDate, undefined);
            if (releaseDateMatches.length > 0) {
                hasReleaseDate = releaseDateMatches.map((d) => {
                    const releaseDateNode = rdf.sym(d.object.value);
                    return {
                        hasDate: new Date(Store.anyValue(releaseDateNode, Ont.hasDate, undefined)!),
                        hasRegion: Store.anyValue(releaseDateNode, Ont.hasRegion, undefined) ?? '',
                    };
                });
            }

            let hasComponents: ComponentModel[] = [];
            const componentMatches = Store.match(subject, Ont.hasComponent, undefined);
            if (componentMatches.length > 0) {
                hasComponents = componentMatches.map((comp) => {
                    const componentNode = rdf.sym(comp.object.value);
                    const componentTypes = Store.match(
                        componentNode,
                        RDF('type'),
                        undefined,
                    ).filter((x) => !x.object.value.includes('NamedIndividual'));

                    const componentType =
                        componentTypes.find((x) => !x.object.value.includes('Component')) ??
                        componentTypes.at(0);

                    return {
                        type:
                            componentType?.object.value.replace(
                                'https://VGCHontology.com/Entities/',
                                '',
                            ) ?? '',
                        identifier: comp.object.value.split('/').at(-1)!,
                        name: Store.anyValue(componentNode, Ont.hasDisplayName, undefined) ?? '',
                        isComponentOfIDs: Store.match(
                            componentNode,
                            Ont.isComponentOf,
                            undefined,
                        ).map((x) => x.object.value),
                        manufacturer: undefined,
                        hasSpecification: [],
                        hasDocumentation: [],
                    };
                });
            }

            const hasSpecifications: string[] = Store.match(
                subject,
                Ont.hasSpecification,
                undefined,
            ).map((x) => x.object.value);

            let hasSuccessor = undefined;
            let isSuccessorOf = undefined;
            if (recurse) {
                const hasSuccessorId = Store.anyValue(subject, Ont.hasSuccessor, undefined);
                const isSuccessorOfId = Store.anyValue(subject, Ont.isSuccessorOf, undefined);
                hasSuccessor = hasSuccessorId
                    ? fetchConsole(rdf.sym(hasSuccessorId), false)
                    : undefined;
                isSuccessorOf = isSuccessorOfId
                    ? fetchConsole(rdf.sym(isSuccessorOfId), false)
                    : undefined;
            }

            const summary = Store.anyValue(subject, Ont.hasConsoleSummary, undefined) ?? undefined;
            const description =
                Store.anyValue(subject, Ont.hasConsoleDescription, undefined) ?? undefined;

            return {
                iri: subject.value,
                identifier: subject.value.split('/').at(-1)!,
                type,
                name: hasDisplayName,
                hasReleaseDate,
                hasSuccessor,
                isSuccessorOf,
                hasDocumentation,
                isCreatedBy,
                summary,
                description,
                hasComponents,
                hasSpecifications,
            } as Console;
        };

        let queryResults = Store.match(undefined, RDF('type'), Ont.Console);
        if (filterIdentifiers?.length) {
            queryResults = queryResults.filter((triple) => {
                const identifier = triple.subject.value.split('/').at(-1)!;
                return filterIdentifiers.includes(identifier);
            });
        }

        const results: Console[] = [];
        for (const triple of queryResults) {
            const subject = triple.subject;
            const consoleObj = fetchConsole(subject, true);
            if (consoleObj) {
                results.push(consoleObj);
            }
        }

        return results;
    }

    private async _initializeOntology(): Promise<rdf.Store> {
        const store = new rdf.Store();
        const fp = getFileProvider();

        const localFile = await fp.getFile('inferred-export.turtle');
        if (!localFile) throw new Error('Ontology file is unavailable');

        const file = new TextDecoder('utf-8').decode(localFile.fileBytes);

        // Load and parse the ontology
        rdf.parse(file, store, 'https://VGCHontology.com', 'text/turtle', (err) => {
            if (err) throw err;
        });

        this._doVerifyOntology(store);
        this.store = store;

        return store;
    }

    private async _doVerifyOntology(store: rdf.Store) {
        const n64Subject = VGCH('Nintendo_64');

        const consolePreds = store.match(n64Subject, null, null);
        if (!consolePreds) {
            throw new Error('No n64 preds found');
        }

        const consoleType = store.match(n64Subject, RDF('type'), Ont.Console);
        if (!consoleType.length) {
            throw new Error('Nintendo 64 is not typed as a Console');
        }

        const hardwareTest = store.any(n64Subject, Ont.hasHardwareTest, undefined);
        if (!hardwareTest) {
            throw new Error('Missing hardware test information');
        }
        const displayName = store.anyValue(n64Subject, Ont.hasDisplayName, undefined);

        if (!displayName) {
            throw new Error('Missing English display name');
        }
    }

    async getComponents(idsOrIRIs: string[]): Promise<(ComponentModel | undefined)[]> {
        let Store = this.store;
        if (!Store) {
            Store = await this._initializeOntology();
        }

        // Helper to normalize to full IRI
        const normalizeIRI = (idOrIRI: string) =>
            idOrIRI.startsWith('https://VGCHontology.com/Entities/')
                ? idOrIRI
                : `https://VGCHontology.com/Entities/${idOrIRI}`;

        const results: (ComponentModel | undefined)[] = [];
        for (const idOrIRI of idsOrIRIs) {
            const iri = normalizeIRI(idOrIRI);
            const subject = rdf.sym(iri);
            // Check if it is a Component
            const isComponent = Store.holds(subject, RDF('type'), Ont.Component);
            if (!isComponent) {
                results.push(undefined);
                continue;
            }

            // Populate ComponentModel fields
            const identifier = subject.value.split('/').at(-1)!;
            const name = Store.anyValue(subject, Ont.hasDisplayName, undefined) ?? '';

            // Example: get manufacturer if present
            let manufacturer: Manufacturer | undefined = undefined;
            const createdByTriple = Store.match(subject, Ont.isCreatedBy, undefined)[0];
            if (createdByTriple) {
                const createdByNode = rdf.sym(createdByTriple.object.value);
                manufacturer = {
                    name: Store.anyValue(createdByNode, Ont.hasDisplayName, undefined) ?? '',
                    uri: createdByNode.value,
                    hasCreatedIDs: Store.match(createdByNode, Ont.hasCreated, undefined).map(
                        (x) => x.object.value,
                    ),
                    identifier: createdByNode.value.split('/').at(-1) ?? '',
                    manufacturerType: 'Component',
                };
            }

            let specifications: string[] = [];
            const matches = Store.match(subject, Ont.hasSpecification, undefined);
            if (matches.length) {
                specifications = matches.map((x) => x.object.value);
            }

            const componentTypes = Store.match(subject, RDF('type'), undefined).filter(
                (x) =>
                    !x.object.value.includes('Component') &&
                    !x.object.value.includes('NamedIndividual'),
            );

            const componentType =
                componentTypes.at(0)?.object.value.split('/').at(-1) ?? 'Component';

            // Documentation
            let hasDocumentation: Documentation[] = [];
            const docMatches = Store.match(subject, Ont.hasDocumentation, undefined);
            if (docMatches.length > 0) {
                hasDocumentation = docMatches.map((d) => {
                    const docNode = rdf.sym(d.object.value);
                    const docTypes = Store.match(docNode, RDF('type'), undefined).filter(
                        (x) => !x.object.value.includes('NamedIndividual'),
                    );

                    const docType =
                        docTypes.find((x) => !x.object.value.includes('Documentation')) ??
                        docTypes.at(0);

                    return {
                        type:
                            docType?.object.value.replace(
                                'https://VGCHontology.com/Entities/',
                                '',
                            ) ?? '',
                        hasDisplayName:
                            Store.anyValue(docNode, Ont.hasDisplayName, undefined) ?? '',
                        hasDocumentationLink:
                            Store.anyValue(docNode, Ont.hasDocumentationLink, undefined) ?? '',
                        hasDocumentationSource:
                            Store.anyValue(docNode, Ont.hasDocumentationSource, undefined) ?? '',
                        isDocumentationOf:
                            Store.anyValue(docNode, Ont.isDocumentationOf, undefined) ?? '',
                        identifier: d.object.value.split('/').at(-1)!,
                    };
                });
            }

            const isComponentOfIDs = Store.match(subject, Ont.isComponentOf, undefined).map(
                (x) => x.object.value.split('/').at(-1)!,
            );

            const isComponentOf = await this.getConsoles(isComponentOfIDs);

            // Build and return the ComponentModel
            const component: ComponentModel = {
                manufacturer,
                type: componentType,
                identifier,
                name: name,
                hasDocumentation,
                isComponentOfIDs,
                isComponentOf,
                hasSpecification: specifications,
            };
            results.push(component);
        }
        return results;
    }

    async getManufacturers(filterIdentifiers?: string[]): Promise<Manufacturer[]> {
        let Store = this.store;
        if (!Store) {
            Store = await this._initializeOntology();
        }

        const results: Manufacturer[] = [];
        let queryResults = Store.match(undefined, RDF('type'), Ont.Manufacturer);

        if (filterIdentifiers?.length) {
            queryResults = queryResults.filter((triple) => {
                const identifier = triple.subject.value.split('/').at(-1)!;
                return filterIdentifiers.includes(identifier);
            });
        }

        for (const triple of queryResults) {
            const subject = triple.subject;
            const identifier = triple.subject.value.split('/').at(-1)!;
            const name = Store.anyValue(subject, Ont.hasDisplayName, undefined) ?? '';
            const uri = subject.value;

            // Find all consoles produced by this manufacturer
            const hasCreatedTriples = Store.match(subject, Ont.hasCreated, undefined);
            const hasCreatedIDs: string[] = hasCreatedTriples.map((x) => x.object.value);

            const manufacturerType = Store.match(subject, RDF('type'), Ont.ConsoleManufacturer)
                .length
                ? 'Console'
                : 'Component';

            let hasCreatedConsoles: Console[] | undefined = undefined;
            let hasCreatedComponents: ComponentModel[] | undefined = undefined;

            if (manufacturerType === 'Console') {
                const ids = hasCreatedIDs.map((x) => x.split('/').at(-1)!);
                hasCreatedConsoles = (await this.getConsoles(ids)).filter((x) => x !== undefined);
            } else {
                hasCreatedComponents = (await this.getComponents(hasCreatedIDs)).filter(
                    (x) => x !== undefined,
                );
            }

            const result: Manufacturer = {
                name,
                uri,
                hasCreatedIDs,
                identifier,
                hasCreatedComponents,
                hasCreatedConsoles,
                manufacturerType,
            };
            results.push(result);
        }
        return results;
    }
}

let __mapper: OntologyMapper | undefined = undefined;

export const getOntologyMapper = () => {
    __mapper ??= new OntologyMapper();
    return __mapper;
};
