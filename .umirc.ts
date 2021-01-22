import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/webgl_animation_cloth',component:'@/pages/webgl_animation_cloth/index'},
  ],
  fastRefresh: {},
});
