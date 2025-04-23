import {mat4} from "gl-matrix";

class EnvironmentRenderer {
    private readonly gl: WebGLRenderingContext;
    private skyboxTexture: WebGLTexture | null = null;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.loadSkybox();
    }

    private loadSkybox(): void {
        const gl = this.gl;
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        const faceInfos = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'textures/skybox_px.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'textures/skybox_nx.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'textures/skybox_py.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'textures/skybox_ny.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'textures/skybox_pz.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'textures/skybox_nz.jpg' },
        ];

        faceInfos.forEach((face) => {
            gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]) // голубой заглушка
            );

            const image = new Image();
            image.src = face.url;
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };
        });

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.skyboxTexture = texture;
    }


    public applyFog(fragmentShaderSource: string): string {
        // Вставка fog logic в GLSL код
        return fragmentShaderSource.replace(
            /void\s+main\s*\(\)\s*{/,
            `
void main() {
    vec4 color = texture2D(u_texture, v_texcoord);
    vec3 fogColor = vec3(0.2, 0.2, 0.2);
    float fogDensity = 0.08;
    float fogFactor = exp(-pow(v_depth * fogDensity, 2.0));
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    vec3 finalColor = mix(fogColor, color.rgb, fogFactor);
    gl_FragColor = vec4(finalColor, color.a);
    return;
}
`
        );
    }

    public drawSkybox(
        projectionMatrix: mat4,
        viewMatrix: mat4,
        uMatrixLocation: WebGLUniformLocation,
        uTextureLocation: WebGLUniformLocation,
        cubeIndexCount: number
    ): void {
        if (!this.skyboxTexture) return;

        const gl = this.gl;

        const viewNoTranslation = mat4.clone(viewMatrix);
        viewNoTranslation[12] = 0;
        viewNoTranslation[13] = 0;
        viewNoTranslation[14] = 0;

        const mvp = mat4.create();
        mat4.multiply(mvp, projectionMatrix, viewNoTranslation);

        gl.uniformMatrix4fv(uMatrixLocation, false, mvp);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexture);
        gl.uniform1i(uTextureLocation, 0);

        gl.drawElements(gl.TRIANGLES, cubeIndexCount, gl.UNSIGNED_SHORT, 0);
    }
}

export {
    EnvironmentRenderer
}