// noinspection JSUnusedGlobalSymbols
export default {
    build: {
        rollupOptions: {
            input: '/main.js',
            output: {
                entryFileNames: `main.min.js`
            }
        }
    }
}