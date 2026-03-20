<template>
  <div class="w-80 bg-sidebar border-l border-sidebar-border flex flex-col gap-8 p-6">
    <Fieldset>
      <FieldLegend>Generation</FieldLegend>
      <FieldContent>
        <Button variant="outline">Random</Button>
      </FieldContent>
    </Fieldset>

    <Fieldset>
      <FieldLegend>Size</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-row items-center gap-4">
          <div
            class="w-10 h-8 flex items-center justify-center border rounded text-sm font-mono bg-muted/30"
          >
            50
          </div>
        </FieldGroup>
      </FieldContent>
    </Fieldset>
    <Fieldset>
      <FieldLegend>Custom Data</FieldLegend>
      <FieldContent>
        <FieldGroup class="flex flex-col gap-2">
          <FieldDescription>Enter comma separated numbers</FieldDescription>
          <Textarea placeholder="12, 5, 8, 30, 2..." class="min-h-30 resize-none" />
        </FieldGroup>
      </FieldContent>
    </Fieldset>

    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  </div>
</template>
