import * as rdf from 'rdflib';

export class TypedVGCH {
    static readonly VGCH = rdf.Namespace('https://VGCHontology.com/Entities/');

    static readonly hasDisplayName = this.VGCH('hasDisplayName');
    static readonly isCreatedBy = this.VGCH('isCreatedBy');
    static readonly hasCreated = this.VGCH('hasCreated');
    static readonly hasDocumentation = this.VGCH('hasDocumentation');
    static readonly hasDocumentationLink = this.VGCH('hasDocumentationLink');
    static readonly hasDocumentationSource = this.VGCH('hasDocumentationSource');
    static readonly hasHardwareTest = this.VGCH('hasHardwareTest');
    static readonly isDocumentationOf = this.VGCH('isDocumentationOf');
    static readonly hasReleaseDate = this.VGCH('hasReleaseDate');
    static readonly hasDate = this.VGCH('hasDate');
    static readonly hasRegion = this.VGCH('hasRegion');
    static readonly hasSuccessor = this.VGCH('hasSuccessor');
    static readonly isSuccessorOf = this.VGCH('isSuccessorOf');
    static readonly hasConsoleSummary = this.VGCH('hasConsoleSummary');
    static readonly hasConsoleDescription = this.VGCH('hasConsoleDescription');
    static readonly Console = this.VGCH('Console');
    static readonly ConsoleManufacturer = this.VGCH('ConsoleManufacturer');
    static readonly ComponentManufacturer = this.VGCH('ComponentManufacturer');
    static readonly Manufacturer = this.VGCH('Manufacturer');
    static readonly hasComponent = this.VGCH('hasComponent');
    static readonly isComponentOf = this.VGCH('isComponentOf');
    static readonly hasSpecification = this.VGCH('hasSpecification');
    static readonly Component = this.VGCH('Component');
}
