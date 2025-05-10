import {Plugin} from 'vite'

type BuildMode = 'development' | 'production'

type BuildPaths = {
    entry: string,
    outDir: string,
}


type BuildOptions = {
    minify: boolean,
    open: boolean,
    port: number,
    root: string,
    paths: BuildPaths,
    plugins?: Plugin[]
}

export type {
    BuildMode,
    BuildPaths,
    BuildOptions,
}