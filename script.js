let projectsData = [];

async function loadProjects() {
    const data = await window.electronAPI.loadData();
    projectsData = data.projects || [];
    renderSidebar();
    renderMain();
}

function renderSidebar() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    projectsData.forEach((project, idx) => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'sidebar-item';
        projectDiv.textContent = project.name;
        projectDiv.onclick = () => showProject(idx);

        const settingsDiv = document.createElement('div');
        settingsDiv.className = 'options-wrapper';
        settingsDiv.innerHTML = `
            <button class="options-button" aria-label="Toggle menu">⋮</button>
            <div class="options-dropdown" id="optionsDropdown${idx}">
                <button onclick="editProject(${idx})">Edit JSON</button>
                <button onclick="deleteProject(${idx})">Delete</button>
            </div>
        `;

        projectDiv.appendChild(settingsDiv);
        projectList.appendChild(projectDiv);
    });

    // Set up dropdown behavior
    setupDropdowns();
    adjustProjectListMinHeight(); // <-- Add this line
}

function renderMain() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<p>Select a project from the sidebar.</p>';
}


let currentProjectIndex = null;
function showProject(projectIndex) {
    if (projectIndex === currentProjectIndex) {
        // If the same project is clicked, do nothing
        return;
    }

    currentProjectIndex = projectIndex;
    const project = projectsData[projectIndex];
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    // Create header row with project name and Close All button
    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = '16px';

    // const projectTitle = document.createElement('h2');
    // projectTitle.textContent = project.name;
    // projectTitle.style.marginRight = '16px';

    const closeAllBtn = document.createElement('button');
    closeAllBtn.id = 'close-all-btn';
    closeAllBtn.className = 'button';
    closeAllBtn.textContent = 'Close All';
    closeAllBtn.style.marginLeft = 'auto';
    closeAllBtn.onclick = function () {
        document.querySelectorAll('.step-card-body.open').forEach(el => el.classList.remove('open'));
        document.querySelectorAll('.arrow.expanded').forEach(el => el.classList.remove('expanded'));
    };

    // headerRow.appendChild(projectTitle);
    headerRow.appendChild(closeAllBtn);

    main.appendChild(headerRow);

    // Project description
    // const desc = document.createElement('p');
    // desc.textContent = project.description;
    // main.appendChild(desc);

    // Render steps
    // project.steps.forEach(step => {
    //     const card = renderStepCard(step);
    //     if (card) main.appendChild(card);
    // });

    // Attach parent = null for root
    const card = renderStepCard(project, null);
    if (card) main.appendChild(card);
}

// Recursive function to render steps
function renderStepCard(item, parent) {
    if (parent) item.parent = parent;
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';

    // --- Header ---
    const stepHeader = document.createElement('div');
    stepHeader.className = 'step-header';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.innerHTML = '&#9654;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked || false;
    checkbox.onclick = (e) => e.stopPropagation();

    const textSpan = document.createElement('span');
    textSpan.textContent = item.name || item.step || item;

    stepHeader.appendChild(arrow);
    stepHeader.appendChild(checkbox);
    stepHeader.appendChild(textSpan);

    // If no substeps, add context input and button to header (inline)
    const substeps = item.substeps || [];
    if (substeps.length === 0) {
        const contextInput = document.createElement('input');
        contextInput.type = 'text';
        contextInput.placeholder = 'Add context...';
        contextInput.className = 'text-input';
        contextInput.onclick = (e) => e.stopPropagation();
        contextInput.onfocus = (e) => e.stopPropagation();

        const subtaskBtn = document.createElement('button');
        subtaskBtn.textContent = 'Subtask this';
        subtaskBtn.className = 'button';

        subtaskBtn.onclick = async (e) => {
            e.stopPropagation();
            subtaskBtn.disabled = true;
            try {
                await subtaskThis(item, contextInput.value, subtaskBtn, stepHeader);
                if (typeof currentProjectIndex === 'number') {
                    showProject(currentProjectIndex);
                }
            } catch (err) {
                alert('Failed to generate substeps: ' + (err.message || err));
            } finally {
                subtaskBtn.disabled = false;
            }
        };

        stepHeader.appendChild(contextInput);
        stepHeader.appendChild(subtaskBtn);
    }

    // --- Card Body ---
    const cardBody = document.createElement('div');
    cardBody.className = 'step-card-body';

    // Notes area (always at top)
    const notesHeader = document.createElement('div');
    notesHeader.textContent = 'Description/Notes:';
    notesHeader.style.fontWeight = 'bold';
    notesHeader.style.marginBottom = '6px';
    cardBody.appendChild(notesHeader);

    const notesArea = document.createElement('textarea');
    notesArea.className = 'text-area';
    notesArea.placeholder = 'Add notes here...';
    notesArea.value = item.description || '';
    notesArea.oninput = function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        item.description = this.value;
    };
    notesArea.style.height = 'auto';
    notesArea.style.height = (notesArea.scrollHeight) + 'px';

    cardBody.appendChild(notesArea);

    // Substeps
    // a header that says "Substeps" if there are any
    if (substeps.length > 0) {
        const substepsHeader = document.createElement('div');
        substepsHeader.textContent = 'Substeps:';
        substepsHeader.style.fontWeight = 'bold';
        substepsHeader.style.marginBottom = '6px';
        cardBody.appendChild(substepsHeader);
    }
    substeps.forEach(sub => {
        cardBody.appendChild(renderStepCard(sub, item));
    });

    // Toggle expand/collapse
    let expanded = false;
    stepHeader.onclick = (e) => {
        const isOpen = cardBody.classList.contains('open');
        cardBody.classList.toggle('open', !isOpen);
        arrow.classList.toggle('expanded', !isOpen);
        e.stopPropagation();
    };

    stepDiv.appendChild(stepHeader);
    stepDiv.appendChild(cardBody);

    return stepDiv;
}

// Placeholder for your API call
async function subtaskThis(item, context) {
    const apiKey = ''; // Replace with your actual key
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    // check if api key is set
    if (!apiKey) {
        console.error('API key is not set. Please set your OpenAI API key.');
        alert('API key is not set. Please set your OpenAI API key.');
        return;
    }

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.display = 'inline-block';
    spinner.style.marginLeft = '8px';

    if (arguments.length >= 4 && arguments[3] && arguments[3].appendChild) {
            arguments[3].appendChild(spinner);
    }
    const name = item.name;
    const description = item.description || '';

    // Collect ancestor step names
    let ancestors = [];
    let parent = item.parent;
    while (parent) {
        ancestors.unshift(parent.name);
        parent = parent.parent;
    }
    let ancestorText = ancestors.length > 0 ? `\nAncestor steps: ${ancestors.join(" > ")}` : "";
    const prompt = `Break down the following step into smaller substeps:
Ancestor Steps: ${ancestorText}
Step name: "${name}"
Step description: "${description}"
Extra instructions: ${context}`;
    // Read prompt.txt and use its content as the system message
    let systemPrompt;
    const promptTxtResponse = await fetch('system_prompt.txt');
    if (promptTxtResponse.ok) {
        systemPrompt = await promptTxtResponse.text();
    } else {
        throw new Error('Could not load system_prompt.txt');
    }


    const body = {
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ]
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
    }

    if (!response.ok) {
        let errText = await response.text();
        throw new Error('OpenAI API error: ' + errText);
    }

    const json = await response.json();
    
    // The breakdown from ChatGPT
    let content = json.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(content);
        console.log('Parsed JSON:', parsed);
    } catch (e) {
        // If not valid JSON, try to extract JSON from text
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            parsed = JSON.parse(match[0]);
        } else {
            throw new Error('Could not parse substeps from response');
        }
    }

    if (parsed && Array.isArray(parsed.substeps)) {
        item.substeps = parsed.substeps;
        save(); // Save the updated project data
        
    } else {
        throw new Error('No substeps found in response');
    }
    
}

// Start loading data
loadProjects();

document.getElementById('close-all-btn').onclick = function () {
    // Collapse all open steps/substeps
    document.querySelectorAll('.step-card-body.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.arrow.expanded').forEach(el => el.classList.remove('expanded'));
};

function createNewProject() {
    // replace prompt with modal for inputting project name and description

    const modal = document.createElement('div');
    
    modal.innerHTML = `
        <div class="modal">
            <h2>Create New Project</h2>
            <p class="modal-label" for="project-name">Project Name:</p>
            <input type="text" class="text-input" id="project-name" />
            <p class="modal-label" for="project-description">Project Description:</p>
            <textarea class="text-area" id="project-description"></textarea>
            <button class="button" id="create-project-btn">Create Project</button>
            <button class="button" id="cancel-project-btn">Cancel</button>
        </div>
    `;
    // Escape key closes modal
    function escListener(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            overlay.style.display = 'none';
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    document.body.appendChild(modal);

    const createProjectBtn = document.getElementById('create-project-btn');
    createProjectBtn.onclick = () => {
        const projectName = document.getElementById('project-name').value;
        const projectDescription = document.getElementById('project-description').value;
        if (projectName) {
            const newProject = {
                name: projectName,
                description: projectDescription,
                steps: []
            };
            projectsData.push(newProject);
            renderSidebar();
            showProject(projectsData.length - 1); // Show the newly created project

            save(); // Save the new project to data.json

            document.body.removeChild(modal);
            overlay.style.display = 'none';
            document.removeEventListener('keydown', escListener);
        }
    };

    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    cancelProjectBtn.onclick = () => {
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };
}


// Function to edit project
// This function opens a modal that shows a text area with the json of that project. It have a save button that saves the changes to the json file.
function editProject(projectIndex) {
    const project = projectsData[projectIndex];
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal" id="json-modal">
            <h2>Edit Project JSON</h2>
            <textarea class="text-area" id="project-json">${JSON.stringify(project, null, 2)}</textarea>
            <button class="button" id="save-project-btn">Save</button>
            <button class="button" id="cancel-edit-btn">Cancel</button>
        </div>
    `;
    // Escape key closes modal
    function escListener(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            overlay.style.display = 'none';
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    document.body.appendChild(modal);

    const saveProjectBtn = document.getElementById('save-project-btn');
    saveProjectBtn.onclick = () => {
        const jsonText = document.getElementById('project-json').value;
        try {
            const updatedProject = JSON.parse(jsonText);
            projectsData[projectIndex] = updatedProject;
        } catch (error) {
            alert('Invalid JSON format. Please correct it.');
            return;
        }

        document.body.removeChild(modal);
        overlay.style.display = 'none';
        save();
        document.removeEventListener('keydown', escListener);
    };

    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    cancelEditBtn.onclick = () => {
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };
}

// Function to delete project
function deleteProject(projectIndex) {
    if (confirm('Are you sure you want to delete this project?')) {
        projectsData.splice(projectIndex, 1);
        renderSidebar();
        renderMain();
        currentProjectIndex = null; // Reset current project index
    }
}

async function save() {
    try {
        await window.electronAPI.saveData({ projects: projectsData });
        renderSidebar();
        if (currentProjectIndex != null) {
            const oldProjectIndex = currentProjectIndex;
            currentProjectIndex = null;
            showProject(oldProjectIndex);
        } else {
            renderMain();
        }
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}



function observeDropdownVisibility(dropdown) {
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const computedStyle = window.getComputedStyle(dropdown);
                const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';
                if (isHidden) {
                    console.log('Dropdown is hidden');
                }
            }
        });
    });

    // Start observing the dropdown for style changes
    observer.observe(dropdown, { attributes: true, attributeFilter: ['style'] });
}

function setupDropdowns() {
    const dropdownButtons = document.querySelectorAll('.options-button');

    dropdownButtons.forEach((button) => {
        const dropdown = button.nextElementSibling;

        // Handle button click to toggle dropdown
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from propagating to the document
            // Close all other dropdowns
            document.querySelectorAll('.options-dropdown.show').forEach((dd) => {
                if (dd !== dropdown) dd.classList.remove('show');
            });
            // Toggle the current dropdown
            dropdown.classList.toggle('show');
        });

        // Hide the dropdown when the mouse leaves it
        dropdown.addEventListener('mouseleave', () => {
            dropdown.classList.remove('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.options-dropdown.show').forEach((dd) => dd.classList.remove('show'));
    });
}

// Call this function after rendering the sidebar
setupDropdowns();

function openSettingsModal() {
    const modal = document.createElement('div');
    // Get saved folder or use default (e.g., user's Documents/SubTask)
    const defaultFolder = (window?.navigator?.userAgent.includes("Windows"))
        ? `${(window?.process?.env?.USERPROFILE || "C:\\Users\\Public")}\\Documents\\SubTask`
        : `${(window?.process?.env?.HOME || "/home/user")}/Documents/SubTask`;
    const savedFolder = localStorage.getItem('subtask_settings_folder') || defaultFolder;

    modal.innerHTML = `
        <div class="modal" id="preferences-modal">
            <h2>Preferences</h2>
            <label class="modal-label" for="api-key-input">OpenAI API Key:</label>
            <input type="password" class="text-input" id="api-key-input" placeholder="Enter your API key" />
            <label class="modal-label" for="model-select">OpenAI Model:</label>
            <select class="text-input" id="model-select">
                <option value="gpt-4.1-nano-2025-04-14">gpt-4.1-nano-2025-04-14 ($0.50/million)</option>
                <option value="gpt-4o">gpt-4o ($5.00/million in, $15.00/million out)</option>
                <option value="gpt-4-turbo">gpt-4-turbo ($10.00/million in, $30.00/million out)</option>
                <option value="gpt-4-turbo-2024-04-09">gpt-4-turbo-2024-04-09 ($10.00/million in, $30.00/million out)</option>
                <option value="gpt-4-0125-preview">gpt-4-0125-preview ($10.00/million in, $30.00/million out)</option>
                <option value="gpt-4-1106-preview">gpt-4-1106-preview ($10.00/million in, $30.00/million out)</option>
                <option value="gpt-4-vision-preview">gpt-4-vision-preview ($10.00/million in, $30.00/million out)</option>
                <option value="gpt-4">gpt-4 ($30.00/million in, $60.00/million out)</option>
                <option value="gpt-4-32k">gpt-4-32k ($60.00/million in, $120.00/million out)</option>
                <option value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125 ($0.50/million in, $1.50/million out)</option>
                <option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106 ($0.50/million in, $1.50/million out)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo ($0.50/million in, $1.50/million out)</option>
                <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k ($3.00/million in, $4.00/million out)</option>
            </select>
            <label class="modal-label" for="settings-folder-input">Settings/Theme Folder:</label>
            <input type="text" class="text-input" id="settings-folder-input" value="${savedFolder}" placeholder="Folder to save settings and themes" />
            <button class="button" id="save-preferences-btn">Save</button>
            <button class="button" id="cancel-preferences-btn">Cancel</button>
        </div>
    `;

    // Escape key closes modal
    function escListener(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            overlay.style.display = 'none';
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    document.body.appendChild(modal);

    // Load saved API key if available
    const apiKeyInput = document.getElementById('api-key-input');
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) apiKeyInput.value = savedKey;

    // Load saved model if available
    const modelSelect = document.getElementById('model-select');
    const savedModel = localStorage.getItem('openai_model');
    if (savedModel) modelSelect.value = savedModel;

    // Load saved folder if available
    const folderInput = document.getElementById('settings-folder-input');

    document.getElementById('save-preferences-btn').onclick = () => {
        localStorage.setItem('openai_api_key', apiKeyInput.value);
        localStorage.setItem('openai_model', modelSelect.value);
        localStorage.setItem('subtask_settings_folder', folderInput.value);
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };

    document.getElementById('cancel-preferences-btn').onclick = () => {
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };
}

function openThemeModal() {
    // Define theme variables to match those in your CSS :root
    const themeVars = [
        { name: '--bg-color', label: 'Background (body)' },
        { name: '--sidebar-bg', label: 'Sidebar Background' },
        { name: '--main-bg', label: 'Main Background' },
        { name: '--card-bg', label: 'Card Background' },
        { name: '--accent-color', label: 'Accent Color' },
        { name: '--accent-hover', label: 'Accent Hover' },
        { name: '--text-color', label: 'Text Color' },
        { name: '--substep-color', label: 'Substep Color' },
        { name: '--border-color', label: 'Border Color' },
        { name: '--input-bg', label: 'Input Background' }
    ];

    // Get current values from :root (live)
    const rootStyles = getComputedStyle(document.documentElement);

    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal" id="theme-modal">
            <h2>Theme Settings</h2>
            <div id="theme-vars-list"></div>
            <div class="theme-modal-actions">
                    <button class="button" id="save-theme-btn">Save</button>
                    <button class="button" id="cancel-theme-btn">Cancel</button>
                    <button class="button" id="export-theme-btn">Export Theme</button>
                    <button class="button" id="import-theme-btn">Import Theme</button>
                    <input type="file" id="theme-import-file" accept="application/json" style="display:none;" />
                </div>
            </div>
        </div>
    `;

    // Escape key closes modal
    function escListener(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            overlay.style.display = 'none';
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';
    document.body.appendChild(modal);

    // Populate color pickers for each CSS variable
    const varsList = modal.querySelector('#theme-vars-list');
    themeVars.forEach(({ name, label }) => {
        let current = rootStyles.getPropertyValue(name).trim();
        if (!current) current = '#ffffff';
        const row = document.createElement('div');
        row.className = 'theme-color-row';
        row.innerHTML = `
            <label class="theme-color-label" for="color-${name}">${label}</label>
            <input type="color" class="theme-color-input" id="color-${name}" value="${rgbToHex(current)}" />
            <span class="theme-color-hex" id="hex-${name}">${rgbToHex(current)}</span>
        `;
        varsList.appendChild(row);

        // Update hex value on color change
        row.querySelector(`#color-${name}`).addEventListener('input', function() {
            row.querySelector(`#hex-${name}`).textContent = this.value;
        });
    });

    // Export theme as JSON
    document.getElementById('export-theme-btn').onclick = () => {
        const themeObj = {};
        themeVars.forEach(({ name }) => {
            themeObj[name] = modal.querySelector(`#color-${name}`).value;
        });
        const blob = new Blob([JSON.stringify(themeObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subtask-theme.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import theme from JSON
    document.getElementById('import-theme-btn').onclick = () => {
        document.getElementById('theme-import-file').click();
    };
    document.getElementById('theme-import-file').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const imported = JSON.parse(evt.target.result);
                themeVars.forEach(({ name }) => {
                    if (imported[name]) {
                        modal.querySelector(`#color-${name}`).value = imported[name];
                        modal.querySelector(`#hex-${name}`).textContent = imported[name];
                    }
                });
            } catch (err) {
                alert('Invalid theme file.');
            }
        };
        reader.readAsText(file);
        // Reset file input so the same file can be imported again if needed
        e.target.value = '';
    };

    document.getElementById('save-theme-btn').onclick = () => {
        themeVars.forEach(({ name }) => {
            const color = modal.querySelector(`#color-${name}`).value;
            // Set the CSS variable in :root (live update)
            document.documentElement.style.setProperty(name, color);
            // Save to localStorage for persistence
            localStorage.setItem('theme_' + name, color);
        });
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };

    document.getElementById('cancel-theme-btn').onclick = () => {
        document.body.removeChild(modal);
        overlay.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    };
}

// Helper to convert rgb/rgba to hex
function rgbToHex(rgb) {
    if (!rgb) return '#ffffff';
    if (rgb.startsWith('#')) return rgb;
    const result = rgb.match(/\d+/g);
    if (!result) return '#ffffff';
    let [r, g, b] = result;
    r = parseInt(r).toString(16).padStart(2, '0');
    g = parseInt(g).toString(16).padStart(2, '0');
    b = parseInt(b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// On page load, apply saved theme
(function applySavedTheme() {
    // Match the same variables as above
    const themeVars = [
        '--bg-color',
        '--sidebar-bg',
        '--main-bg',
        '--card-bg',
        '--accent-color',
        '--accent-hover',
        '--text-color',
        '--substep-color',
        '--border-color',
        '--input-bg'
    ];
    themeVars.forEach(name => {
        const saved = localStorage.getItem('theme_' + name);
        if (saved) {
            document.documentElement.style.setProperty(name, saved);
        }
    });
})();

function adjustProjectListMinHeight() {
    const projectList = document.getElementById('project-list');
    if (!projectList) return;
    // Calculate total height of all children
    let totalHeight = 0;
    Array.from(projectList.children).forEach(child => {
        totalHeight += child.offsetHeight;
    });
    // Set min-height to totalHeight + 100px
    projectList.style.minHeight = (totalHeight + 100) + 'px';
}