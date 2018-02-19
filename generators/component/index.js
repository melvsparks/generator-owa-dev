const Generator = require('yeoman-generator');
const fs = require('fs');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        /**
         * Helper function to get the current working folder
         * name.
         */
        this._getCurrentFolderName = function() {
            const currentPath = process.cwd();
            const pathParts = currentPath.split('/');
            const currentFolder = pathParts[pathParts.length - 1];

            return currentFolder;
        }

        /**
         * Helper function to capitalize component name.
         */
        this._capitalizeFirstLetter = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }

    component() {
        const componentsDir = 'components';
        const libDir = 'lib';
        const currentFolderName = this._getCurrentFolderName();

        /**
         * User must be in a "lib" or "components" folder to create a component.
         * If not, just bail.
         */
        if (currentFolderName !== libDir && currentFolderName !== componentsDir) {
            this.log('Unable to create component (must be in "lib" or "components" directory).');
            return;
        }

        this.prompt([
            {
                type    : 'input',
                name    : 'componentName',
                message : `What's your component's name?`,
                validate: (value) => {
                    if (value.length) {
                        return true;
                    } else {
                        return `You can't create a component without a name. C'mon.`
                    }
                },
                filter: (value) => {
                    return this._capitalizeFirstLetter(value);
                }
            }
        ]).then(answers => {
            const componentName = answers.componentName;

            let isInLib = false;

            /**
             * If user is currently in a "lib" folder, we're good. Then,
             * check to see if "components" folder exists. If it doesn't, create
             * it. Then change into it.
             */
            if (this._getCurrentFolderName().toLowerCase() === libDir) {
                isInLib = true;

                // If "components" directory doesn't exist, create it.
                if (!fs.existsSync(componentsDir)) {
                    fs.mkdirSync(componentsDir);
                }

                // Go into "components" directory.
                process.chdir(componentsDir);
            }

            /**
             * If user is a "components" folder and a component with the same name
             * doesn't exist, we're good. If those conditions haven't been met, bail.
             */
            if (!fs.existsSync(`${componentName}.tsx`)) {
                const componentDestinationPath = isInLib ? `components/${componentName}.tsx` : `${componentName}.tsx`;
                const stylesDestinationPath = isInLib ? `components/${componentName}.scss` : `${componentName}.scss`;

                // Copy over .tsx template.
                this.fs.copyTpl(
                    this.templatePath('Component.tsx'),
                    this.destinationPath(componentDestinationPath),
                    { componentName: componentName }
                );

                // Copy over .scss template.
                this.fs.copyTpl(
                    this.templatePath('Component.scss'),
                    this.destinationPath(stylesDestinationPath),
                    { componentName: componentName }
                );
            } else {
                this.log('Unable to create component (one with the same name already exists at this location).');
            }
        });
    }
};