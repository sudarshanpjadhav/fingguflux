<script>
    import { setFingguContext, Button, Card } from "@finggu/svelte";
    import { writable } from "svelte/store";
    import "@finggu/core/tokens.css";

    let mode = "dev";
    let theme = "light";

    const mapping = {
        "ff-btn": "ff-sz1",
        "ff-btn-primary": "ff-sp1",
        "ff-card": "ff-sc1",
    };

    $: setFingguContext({
        mapping: mode === "ext" ? mapping : null,
        mode,
        theme,
        version: "0.9.0",
    });
</script>

<div style="padding: 2rem;">
    <Card padding="lg" variant="default">
        <h1>Svelte Minimal Example</h1>
        <p>
            Current Mode: <strong>{mode}</strong> | Theme:
            <strong>{theme}</strong>
        </p>

        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <Button
                variant="primary"
                on:click={() => (mode = mode === "dev" ? "ext" : "dev")}
            >
                Toggle Mode
            </Button>
            <Button
                variant="secondary"
                on:click={() => (theme = theme === "light" ? "dark" : "light")}
            >
                Toggle Theme
            </Button>
        </div>
    </Card>
</div>
