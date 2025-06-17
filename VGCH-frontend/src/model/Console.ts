export interface Console {
    iri: string; // https://VGCHontology.com/Entities/CONSOLE
    identifier: string;
    type: string; // class type from rdf in case we want more console types in the ontology
    name: string;
    hasReleaseDate: ReleaseDate[];
    hasSuccessor: Console | undefined;
    isSuccessorOf: Console | undefined;
    hasDocumentation: Documentation[];
    isCreatedBy: Manufacturer;
    summary: string | undefined;
    description: string | undefined;
    hasComponents: ComponentModel[];
    hasSpecifications?: string[];
}

export interface ComponentModel {
    type: string;
    manufacturer: Manufacturer | undefined;
    identifier: string;
    name: string;
    isComponentOfIDs: string[];

    isComponentOf?: Console[];
    hasSpecification: string[];
    hasDocumentation: Documentation[];
}

export interface Manufacturer {
    name: string;
    uri: string;
    manufacturerType: string /* Can be a console or a component manufacturer */;
    identifier: string;

    hasCreatedIDs: string[] /*IRIs */;
    hasCreatedConsoles?: Console[];
    hasCreatedComponents?: ComponentModel[];
}

export interface Documentation {
    type: string;
    identifier: string;
    hasDisplayName: string;
    hasDocumentationLink: string;
    hasDocumentationSource?: string;
    isDocumentationOf: string;
}

export interface ReleaseDate {
    hasRegion: string;
    hasDate: Date;
}
