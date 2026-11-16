import { runSmokePackage } from './smoke-package-lib.mjs';

runSmokePackage({
    runtimeChecks: [{ subpath: '.', exports: ['EdgesPanel', 'InspectorPanel', 'default'] }],
    typecheckSubpaths: ['.'],
});
