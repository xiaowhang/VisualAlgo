<template>
  <div
    class="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center px-6 py-20 md:px-10 md:py-24"
  >
    <section class="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
      <p class="font-display text-xs tracking-[0.22em] text-muted-foreground uppercase">Algo Lab</p>
      <h1 class="max-w-3xl text-4xl leading-[1.1] tracking-tight text-charcoal md:text-6xl">
        把抽象算法，变成一眼可懂的可视化流程
      </h1>
      <p class="max-w-2xl text-base leading-7 font-light text-muted-foreground md:text-lg">
        以统一输入驱动排序与图算法演示，逐步播放、暂停、对比与复盘，帮助你更快建立算法直觉。
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          :to="{ name: 'AlgorithmView', params: { category: 'sorting', slug: 'bubble-sort' } }"
        >
          <Button variant="darkPrimary" size="lg">开始演示</Button>
        </RouterLink>
        <RouterLink :to="{ name: 'CompareView' }">
          <Button variant="outline" size="lg">进入对比模式</Button>
        </RouterLink>
      </div>
    </section>

    <section class="mt-20 grid gap-4 md:grid-cols-3">
      <Card class="gap-3 px-6 py-5">
        <h2 class="text-xl leading-[1.2] text-charcoal">逐步执行</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          每一步都提供状态和描述，清晰观察比较、交换、访问与回溯。
        </p>
      </Card>
      <Card class="gap-3 px-6 py-5">
        <h2 class="text-xl leading-[1.2] text-charcoal">同输入对比</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          在同一数据集上并行展示算法差异，用步数与轨迹比较效率与行为。
        </p>
      </Card>
      <Card class="gap-3 px-6 py-5">
        <h2 class="text-xl leading-[1.2] text-charcoal">可控输入</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          支持随机生成、自定义、导入导出，让实验路径可重复、可分享、可验证。
        </p>
      </Card>
    </section>
  </div>
</template>
