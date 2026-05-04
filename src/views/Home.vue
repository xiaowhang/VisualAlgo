<template>
  <div
    class="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center px-6 py-20 md:px-10 md:py-24"
  >
    <section class="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
      <p class="font-display text-xs tracking-[0.22em] text-muted-foreground uppercase">
        算法实验室
      </p>
      <h1 class="max-w-3xl text-4xl leading-[1.1] tracking-tight text-charcoal md:text-6xl">
        一步步看清算法在做什么
      </h1>
      <p class="max-w-2xl text-base leading-7 font-light text-muted-foreground md:text-lg">
        可视化排序、图、树等算法的每一步操作，支持暂停、回放和并行对比。
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
        <h2 class="text-xl leading-[1.2] text-charcoal">逐步播放</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          每一步高亮当前操作，附带状态说明，看清比较、交换、回溯的过程。
        </p>
      </Card>
      <Card class="gap-3 px-6 py-5">
        <h2 class="text-xl leading-[1.2] text-charcoal">并行对比</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          同一数据上并排运行两个算法，直观比较步数和行为差异。
        </p>
      </Card>
      <Card class="gap-3 px-6 py-5">
        <h2 class="text-xl leading-[1.2] text-charcoal">自由输入</h2>
        <p class="text-sm leading-6 text-muted-foreground">
          随机生成或手动编辑数据，支持导入导出，方便反复实验。
        </p>
      </Card>
    </section>
  </div>
</template>
