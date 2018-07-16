/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
    /**
     * The path to create the dialog.
     */
    path?: string;
    /**
     * The name of the project.
     */
    project?: string;
    /**
     * The name of the dialog.
     */
    name: string;
    /**
     * Specifies if the style will be in the ts file.
     */
    inlineStyle?: boolean;
    /**
     * Specifies if the template will be in the ts file.
     */
    inlineTemplate?: boolean;
    /**
     * Specifies the view encapsulation strategy.
     */
    viewEncapsulation?: ('Emulated' | 'Native' | 'None');
    /**
     * Specifies the change detection strategy.
     */
    changeDetection?: ('Default' | 'OnPush');
    /**
     * The prefix to apply to generated selectors.
     */
    prefix?: string;
    /**
     * The file extension to be used for style files.
     */
    styleext?: string;
    /**
     * Specifies if a spec file is generated.
     */
    spec?: boolean;
    /**
     * Flag to indicate if a dir is created.
     */
    flat?: boolean;
    /**
     * Flag to skip the module import.
     */
    skipImport?: boolean;
    /**
     * The selector to use for the dialog.
     */
    selector?: string;
    /**
     * Allows specification of the declaring module.
     */
    module?: string;
    /**
     * Specifies if declaring module exports the dialog.
     */
    export?: boolean;
    /**
     * Specifies if the dialog is an entry dialog of declaring module.
     */
    entryComponent?: boolean;
}
