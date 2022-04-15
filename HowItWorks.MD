# How It works (mostly for development)

    new mtl-text-processor({options})
        Instanciating means we can have multiple text processors with different options throughout apps
        This can be reused forever
    optionally mtl-text-processor.setOption() if needed
    process = mtl-text-processor.receiveText(...text)
        Will always generate based on the last set of options
    process.getTranslatables() => array of translatable text
    process.setTranslations(...translated) => void

