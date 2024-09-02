function loadFunnels() {
    fetch('/api/funnels')
        .then(response => response.json())
        .then(funnels => {
            const funnelSelect = document.getElementById('funnel-select');
            funnels.forEach(funnel => {
                const option = document.createElement('option');
                option.value = funnel._id;
                option.textContent = funnel.name;
                funnelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading funnels:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const ruleForm = document.getElementById('rule-create-edit-form');
    const addConditionBtn = document.getElementById('add-condition');
    const conditionsContainer = document.getElementById('conditions-container');
    const ruleAction = document.getElementById('rule-action');
    const rankingValueGroup = document.getElementById('ranking-value-group');
    const dateRange = document.getElementById('date-range');
    const customDateRange = document.getElementById('custom-date-range');

    loadRules();
    loadFunnels();

    ruleForm.addEventListener('submit', handleRuleSubmit);
    addConditionBtn.addEventListener('click', addCondition);
    ruleAction.addEventListener('change', toggleRankingValueVisibility);
    dateRange.addEventListener('change', toggleCustomDateRange);


    function toggleRankingValueVisibility() {
        rankingValueGroup.style.display = 
            ruleAction.value === 'increase_ranking' || ruleAction.value === 'decrease_ranking'
                ? 'block' 
                : 'none';
    }

    function toggleCustomDateRange() {
        customDateRange.style.display = dateRange.value === 'custom' ? 'block' : 'none';
    }

    function handleRuleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ruleData = {
            name: formData.get('name'),
            funnelId: formData.get('funnelId'),
            action: formData.get('action'),
            rankingValue: formData.get('rankingValue'),
            dateRange: formData.get('dateRange'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            applyImmediately: formData.get('applyImmediately') === 'on',
            conditions: []
        };
    
        const conditions = document.querySelectorAll('#conditions-container .condition');
        conditions.forEach(condition => {
            ruleData.conditions.push({
                parameter: condition.querySelector('[name="parameter"]').value,
                operator: condition.querySelector('[name="operator"]').value,
                value1: condition.querySelector('[name="value1"]').value,
                value2: condition.querySelector('[name="value2"]').value || null
            });
        });
    
        saveRule(ruleData);
    }

    function addCondition() {
        const newCondition = document.createElement('div');
        newCondition.className = 'condition form-row align-items-center mb-3';
        newCondition.innerHTML = `
            <div class="col">
                <select name="parameter" class="form-control">
                    <option value="clicks">Clicks</option>
                    <option value="conversions">Conversions</option>
                    <option value="revenue">Revenue</option>
                </select>
            </div>
            <div class="col">
                <select name="operator" class="form-control">
                    <option value="<">Less than</option>
                    <option value=">">Greater than</option>
                    <option value="=">Equal to</option>
                    <option value="between">Between</option>
                </select>
            </div>
            <div class="col value1-container">
                <input type="number" name="value1" required class="form-control">
            </div>
            <div class="col value2-container" style="display: none;">
                <input type="number" name="value2" class="form-control">
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-outline-danger remove-condition">X</button>
            </div>
        `;
        
        const conditionsContainer = document.getElementById('conditions-container');
        conditionsContainer.appendChild(newCondition);
    
        const operatorSelect = newCondition.querySelector('[name="operator"]');
        const value2Container = newCondition.querySelector('.value2-container');
    
        operatorSelect.addEventListener('change', function() {
            value2Container.style.display = this.value === 'between' ? 'block' : 'none';
        });
    
        newCondition.querySelector('.remove-condition').addEventListener('click', function() {
            newCondition.remove();
        });
    }

    function loadRules() {
        fetch('/api/rules')
            .then(response => response.json())
            .then(rules => {
                const activeRulesTable = document.querySelector('#active-rules-table tbody');
                const inactiveRulesTable = document.querySelector('#inactive-rules-table tbody');
                
                activeRulesTable.innerHTML = '';
                inactiveRulesTable.innerHTML = '';

                rules.forEach(rule => {
                    const row = createRuleRow(rule);
                    if (rule.isActive) {
                        activeRulesTable.appendChild(row);
                    } else {
                        inactiveRulesTable.appendChild(row);
                    }
                });
            })
            .catch(error => console.error('Error loading rules:', error));
    }

    function createRuleRow(rule) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rule.name}</td>
            <td>${formatAction(rule.action, rule.rankingValue)}</td>
            <td>${rule.funnelId ? rule.funnelId.name : 'All Funnels'}</td>
            <td>${formatConditions(rule.conditions)}</td>
            <td>${rule.isActive ? 'Active' : 'Inactive'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-danger delete-btn" onclick="deleteRule('${rule._id}')">Delete</button>
                <button class="btn btn-sm btn-outline-secondary toggle-btn" onclick="toggleRule('${rule._id}')">
                    ${rule.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        `;
        return row;
    }

    function formatFunnels(funnelId) {
        if (!funnelId) {
            return 'All Funnels';
        }
        // Ici, vous devriez idéalement avoir une map des IDs de funnel vers leurs noms
        // Pour cet exemple, nous utiliserons juste l'ID
        return `Funnel: ${funnelId}`;
    }

    function formatAction(action, rankingValue, sortParameter) {
        switch (action) {
            case 'disable':
                return 'Disable Product';
            case 'increase_ranking':
                return `Increase Ranking by ${rankingValue}`;
            case 'decrease_ranking':
                return `Decrease Ranking by ${rankingValue}`;
            case 'sort_ascending':
                return `Sort Ascending by ${sortParameter}`;
            case 'sort_descending':
                return `Sort Descending by ${sortParameter}`;
            default:
                return action;
        }
    }

    function formatConditions(conditions) {
        return conditions.map(c => 
            `${c.parameter} ${c.operator} ${c.value1}${c.operator === 'between' ? ' and ' + c.value2 : ''}`
        ).join(' AND ');
    }

    window.editRule = function(ruleId) {
        // Implement edit functionality
    };

    window.deleteRule = function(ruleId) {
        if (confirm('Are you sure you want to delete this rule?')) {
            fetch(`/api/rules/${ruleId}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        loadRules();
                    } else {
                        throw new Error('Failed to delete rule');
                    }
                })
                .catch(error => console.error('Error deleting rule:', error));
        }
    };

    window.toggleRule = function(ruleId) {
        fetch(`/api/rules/${ruleId}/toggle`, { method: 'POST' })
            .then(response => response.json())
            .then(updatedRule => {
                loadRules(); // Recharge toutes les règles
            })
            .catch(error => console.error('Error toggling rule:', error));
    };

    function saveRule(ruleData) {
        fetch('/api/rules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ruleData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(savedRule => {
            console.log('Rule saved successfully:', savedRule);
            loadRules(); // Recharger la liste des règles
            resetForm(); // Réinitialiser le formulaire
        })
        .catch(error => {
            console.error('Error saving rule:', error);
            alert('Failed to save rule. Please try again.');
        });
    }
});

function updateConditionFields() {
    const action = document.getElementById('rule-action').value;
    const conditionsContainer = document.getElementById('conditions-container');
    const rankingValueGroup = document.getElementById('ranking-value-group');
    const addConditionBtn = document.getElementById('add-condition');

    if (action === 'sort_ascending' || action === 'sort_descending') {
        conditionsContainer.innerHTML = `
            <div class="form-group">
                <label for="sort-parameter">Sort By :</label>
                <select id="sort-parameter" name="sortParameter" class="form-control">
                    <option value="clicks">Clicks</option>
                    <option value="conversions">Conversions</option>
                    <option value="revenue">Revenue</option>
                </select>
            </div>
        `;
        rankingValueGroup.style.display = 'none';
        addConditionBtn.style.display = 'none';
    } else {
        if (conditionsContainer.children.length === 0) {
            addCondition();
        }
        rankingValueGroup.style.display = 
            (action === 'increase_ranking' || action === 'decrease_ranking') ? 'block' : 'none';
        addConditionBtn.style.display = 'block';
    }
}

document.getElementById('rule-action').addEventListener('change', updateConditionFields);


function updateRule(ruleId) {
    const formData = new FormData(document.getElementById('rule-create-edit-form'));
    const ruleData = Object.fromEntries(formData);
    
    if (ruleData.action === 'sort_ascending' || ruleData.action === 'sort_descending') {
        ruleData.sortParameter = document.getElementById('sort-parameter').value;
    } else {
        ruleData.conditions = getConditionsFromForm();
    }

    fetch(`/api/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
    })
    .then(response => response.json())
    .then(() => {
        loadRules();
        resetForm();
    })
    .catch(error => console.error('Error updating rule:', error));
}

function resetForm() {
    document.getElementById('rule-create-edit-form').reset();
    const saveButton = document.querySelector('button[type="submit"]');
    saveButton.textContent = 'Save Rule';
    saveButton.onclick = null;
    updateConditionFields();
}

function getConditionsFromForm() {
    // Implémentez cette fonction pour récupérer les conditions du formulaire
}


// À la fin du fichier rules.js
window.editRule = function(ruleId) {
    fetch(`/api/rules/${ruleId}`)
        .then(response => response.json())
        .then(rule => {
            document.getElementById('rule-name').value = rule.name;
            document.getElementById('rule-action').value = rule.action;
            document.getElementById('ranking-value').value = rule.rankingValue || '';
            document.getElementById('date-range').value = rule.dateRange || 'custom';
            document.getElementById('start-date').value = rule.startDate || '';
            document.getElementById('end-date').value = rule.endDate || '';
            document.getElementById('applyImmediately').checked = rule.applyImmediately;

            updateConditionFields();
            if (rule.action === 'sort_ascending' || rule.action === 'sort_descending') {
                document.getElementById('sort-parameter').value = rule.sortParameter;
            } else {
                conditionsContainer.innerHTML = '';
                rule.conditions.forEach(condition => addCondition(condition));
            }

            const saveButton = document.querySelector('#rule-create-edit-form button[type="submit"]');
            saveButton.textContent = 'Update Rule';
            saveButton.onclick = function(e) {
                e.preventDefault();
                updateRule(ruleId);
            };

            // Faire défiler jusqu'au formulaire
            document.getElementById('rule-form').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => console.error('Error loading rule for edit:', error));
};

document.getElementById('conditions-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-condition')) {
        e.target.closest('.condition').remove();
    }
});