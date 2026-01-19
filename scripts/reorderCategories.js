
async function reorderCategories() {
    const updates = [
        { id: '691a1c311ead825e05b6476a', order: 1, name: 'Sweets' },
        { id: '691076505170edf6cc30562c', order: 2, name: 'Dry Fruit' },
        { id: '691a1ccc1ead825e05b647e0', order: 3, name: 'Namkeen' },
        { id: '691074625170edf6cc3055f2', order: 4, name: 'Savoury Snacks' },
        { id: '691076a55170edf6cc305630', order: 5, name: 'Gift Hampers' },
        { id: '691a1ab1dbc86fe14931d5ec', order: 6, name: 'Bakery Items' }
    ];

    for (const update of updates) {
        console.log(`Updating ${update.name}...`);
        try {
            const res = await fetch(`http://localhost:3000/api/categories/${update.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: update.order })
            });
            const data = await res.json();
            if (data.success) {
                console.log(`Success: ${update.name} order set to ${update.order}`);
            } else {
                console.error(`Failed to update ${update.name}:`, data.error);
            }
        } catch (e) {
            console.error(`Error updating ${update.name}:`, e);
        }
    }
}

reorderCategories();
