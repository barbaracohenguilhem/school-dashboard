/* Homework check-off for the homework & exams card.
   Set HOMEWORK_CHECKOFF_ENABLED to false, or open index.html?homeworkCheckoff=0,
   to leave the original static list in place.
   localStorage stores only the ids of checked items. */
(function () {
    var HOMEWORK_CHECKOFF_ENABLED = true;
    var STORAGE_KEY = 'school-dashboard.homework.checked';

    function enabled() {
        if (!HOMEWORK_CHECKOFF_ENABLED) return false;
        try {
            return new URLSearchParams(window.location.search).get('homeworkCheckoff') !== '0';
        } catch (err) {
            return true;
        }
    }

    function boot() {
        if (!enabled()) return;

        var card = document.getElementById('homework-exams');
        var openList = document.getElementById('homework-open');
        if (!card || !openList) return;

        var items = Array.prototype.slice.call(openList.querySelectorAll('li[data-homework-id]'));
        if (!items.length) return;

        var checked = loadChecked(items);
        var expanded = true;

        var progress = document.createElement('div');
        progress.id = 'homework-progress';
        progress.className = 'mb-2';

        var progressText = document.createElement('p');
        progressText.id = 'homework-progress-text';
        progressText.className = 'text-xs text-gray-500 mb-1';
        progressText.setAttribute('aria-live', 'polite');

        var progressTrack = document.createElement('div');
        progressTrack.className = 'h-1 bg-gray-100 rounded';
        progressTrack.setAttribute('aria-hidden', 'true');

        var progressBar = document.createElement('div');
        progressBar.id = 'homework-progress-bar';
        progressBar.className = 'h-1 bg-yellow-500 rounded';
        progressBar.style.width = '0%';
        progressTrack.appendChild(progressBar);
        progress.appendChild(progressText);
        progress.appendChild(progressTrack);
        openList.parentNode.insertBefore(progress, openList);

        var doneWrap = document.createElement('div');
        doneWrap.id = 'homework-done';
        doneWrap.className = 'mt-3 hidden';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.id = 'homework-done-toggle';
        toggle.className = 'flex items-center text-sm font-semibold text-gray-600';
        toggle.setAttribute('aria-controls', 'homework-done-list');

        var doneList = document.createElement('ul');
        doneList.id = 'homework-done-list';
        doneList.className = 'text-gray-600 text-sm mt-2';

        doneWrap.appendChild(toggle);
        doneWrap.appendChild(doneList);
        openList.parentNode.insertBefore(doneWrap, openList.nextSibling);

        items.forEach(function (li) {
            var id = li.getAttribute('data-homework-id');
            var label = li.textContent.trim();
            li.textContent = '';
            li.className = 'flex items-center transition-opacity duration-200';

            var button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-homework-toggle', id);
            button.className = checkboxClass(false);

            var icon = document.createElement('i');
            icon.className = 'fas fa-check text-xs leading-none invisible';
            icon.setAttribute('aria-hidden', 'true');
            button.appendChild(icon);

            var span = document.createElement('span');
            span.className = 'homework-label';
            span.textContent = label;

            li.appendChild(button);
            li.appendChild(span);

            button.addEventListener('click', function () {
                if (checked[id]) {
                    delete checked[id];
                } else {
                    checked[id] = true;
                    expanded = true;
                }
                saveChecked(items, checked);
                paint();
            });
        });

        toggle.addEventListener('click', function () {
            expanded = !expanded;
            paint();
        });

        function paint() {
            var doneCount = 0;
            items.forEach(function (li) {
                var id = li.getAttribute('data-homework-id');
                var isDone = !!checked[id];
                var button = li.querySelector('button');
                var icon = button.querySelector('i');
                var span = li.querySelector('.homework-label');
                if (isDone) doneCount += 1;

                button.className = checkboxClass(isDone);
                button.setAttribute('aria-pressed', isDone ? 'true' : 'false');
                button.setAttribute(
                    'aria-label',
                    (isDone ? 'Mark not done: ' : 'Mark done: ') + span.textContent
                );
                icon.classList.toggle('invisible', !isDone);
                span.classList.toggle('line-through', isDone);
                li.classList.toggle('opacity-50', isDone);

                if (isDone) {
                    doneList.appendChild(li);
                } else {
                    openList.appendChild(li);
                }
            });

            var total = items.length;
            progressText.textContent = doneCount + ' of ' + total + ' done';
            progressBar.style.width = (total ? Math.round((doneCount / total) * 100) : 0) + '%';

            toggle.textContent = '';
            var chevron = document.createElement('i');
            chevron.className = 'fas ' + (expanded ? 'fa-chevron-down' : 'fa-chevron-right') + ' text-yellow-500 mr-2 text-xs';
            chevron.setAttribute('aria-hidden', 'true');
            var toggleLabel = document.createElement('span');
            toggleLabel.textContent = 'Done (' + doneCount + ')';
            toggle.appendChild(chevron);
            toggle.appendChild(toggleLabel);
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

            doneWrap.classList.toggle('hidden', doneCount === 0);
            doneList.classList.toggle('hidden', !expanded);
        }

        paint();
    }

    function checkboxClass(isDone) {
        var base = 'mr-2 w-4 h-4 shrink-0 rounded border border-yellow-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1';
        return base + (isDone ? ' bg-yellow-500 text-white' : ' bg-white text-white');
    }

    function loadChecked(items) {
        var known = {};
        items.forEach(function (li) {
            known[li.getAttribute('data-homework-id')] = true;
        });
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (!Array.isArray(parsed)) return {};
            var set = {};
            parsed.forEach(function (id) {
                if (typeof id === 'string' && known[id]) set[id] = true;
            });
            return set;
        } catch (err) {
            return {};
        }
    }

    function saveChecked(items, checked) {
        var ids = items.map(function (li) {
            return li.getAttribute('data-homework-id');
        }).filter(function (id) {
            return checked[id];
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
