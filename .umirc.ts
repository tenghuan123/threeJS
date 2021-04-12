import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/webgl_animation_cloth',component:'@/pages/webgl_animation_cloth/index' },
    { path: '/three_study_1',component:'@/pages/webgl_animation_cloth/index_study_1' },
    { path: '/fairywand',component:'@/pages/webgl_animation_cloth/fairywand' },
    { path: '/studyMesh',component:'@/pages/webgl_animation_cloth/studyMesh' },
    { path: '/loaderObject',component:'@/pages/webgl_animation_cloth/loaderObject'},
    { path: '/loaderMMD',component:'@/pages/webgl_animation_cloth/loaderMMd'},
    { path: '/lightAndShadow',component:'@/pages/webgl_animation_cloth/lightAndShadow'},
  ],
  fastRefresh: {},
});
