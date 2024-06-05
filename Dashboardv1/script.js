
document.addEventListener('DOMContentLoaded', () => {
    // Data untuk ditampilkan di dashboard
    const data = [
        {id: 1, content: 'Content 1', category: 'member1'},
        {id: 2, content: 'Content 2', category: 'member2'},
        {id: 3, content: 'Content 3', category: 'member3'},
        {id: 4, content: 'Content 4', category: 'member1'},
        {id: 5, content: 'Content 5', category: 'member2'},
        {id: 6, content: 'Content 6', category: 'member3'}
    ];

    // Function to display data
    function displayData(data) {
        const container = document.getElementById('box-container');
        container.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = `container${item.id}`;
            div.textContent = item.content;
            div.dataset.category = item.category;
            container.appendChild(div);
        });
    }

    // Initial display of data
    displayData(data);

    // Event listener for form submission
    document.getElementById('user-form').addEventListener('submit', function(event) {
        event.preventDefault();
        handleFormSubmit();
    });

    // Event listener for dropdown change
    document.getElementById('team-dropdown').addEventListener('change', function(event) {
        filterContent(event.target.value);
    });

    // Event listener for member links in dropdown
    document.querySelectorAll('.member-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            filterContent(event.target.dataset.member);
        });
    });

    // Event listener for sort dropdown change
    document.getElementById('sort-dropdown').addEventListener('change', function(event) {
        sortContent(event.target.value);
    });

    // Handle form submission
    function handleFormSubmit() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Create a new list item for the submitted message
        const listItem = document.createElement('li');
        listItem.textContent = ` ${name} : ${message}`;

        // Append the new message to the messages list
        document.getElementById('messages-list').appendChild(listItem);

        // Clear the form fields
        document.getElementById('user-form').reset();

        alert('Your comment has been successfully entered!');
    }

    // Filter content based on dropdown selection
    function filterContent(category) {
        const items = document.querySelectorAll('#box-container > div');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    // Sort content function based on selected criteria
    function sortContent(criteria) {
        const container = document.getElementById('box-container');
        const items = Array.from(container.children);

        switch(criteria) {
            case 'content':
                items.sort((a, b) => a.textContent.localeCompare(b.textContent));
                break;
            case 'category':
                items.sort((a, b) => a.dataset.category.localeCompare(b.dataset.category));
                break;
            default:
                items.sort((a, b) => parseInt(a.className.match(/\d+/)[0]) - parseInt(b.className.match(/\d+/)[0]));
                break;
        }

        items.forEach(item => container.appendChild(item));
    }

    // Initial sort to demonstrate functionality
    sortContent('default');
});
