<script setup lang="ts">
import { reactive } from 'vue';
import { submission_type_options } from '@/model/MessageModels';
import type { SubmissionType, Submission } from '@/model/MessageModels';
import { MessageHandler } from '@/Services/messagehandler';

const messageHandler = new MessageHandler();

const form = reactive<Submission>({
    name: '',
    email: '',
    submission_type: '',
    message: '',
});

const errorMessage = reactive({ value: '' });
const isSuccess = reactive({ value: false });

const handleSubmit = async () => {
    errorMessage.value = '';
    isSuccess.value = false;

    if (
        form.submission_type === '' ||
        !submission_type_options.includes(form.submission_type as SubmissionType)
    ) {
        errorMessage.value = 'Select a valid submission type.';
        return;
    }

    const result = await messageHandler.createSubmission(form);
    if (!result.success) {
        errorMessage.value = result.message;
        isSuccess.value = false;
    } else {
        errorMessage.value = 'Submission received! Thank you.';
        isSuccess.value = true;
        setTimeout(() => location.reload(), 900);
    }
};
</script>

<template>
    <main>
        <div class="submissions">
            <h1>Submissions</h1>
        </div>

        <div>
            <p class="pgSpace">
                To make sure that the ontology stays up-to-date and keeps having the best
                information, community submissions are accepted (and greatly appreciated). If
                anything on the website is incorrect, missing, or contains possibly illegal content,
                please use the form below.
            </p>

            <p class="pgSpace">
                If you would like to get in general contact, please go to the <RouterLink to="/about">about</RouterLink> page.
            </p>

            <div class="background-box" style="margin-top: 10%; max-width: 800px">
                <h2 style="margin-bottom: 5%">Submission form</h2>
                <form class="contact-form" @submit.prevent="handleSubmit">
                    <div
                        v-if="errorMessage.value"
                        :class="isSuccess.value ? 'form-success' : 'form-error'"
                    >
                        {{ errorMessage.value }}
                    </div>
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            v-model="form.name"
                            required
                            class="form-control"
                        />
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            v-model="form.email"
                            required
                            class="form-control"
                        />
                    </div>
                    <div class="form-group">
                        <label for="submission_type">Submission Type:</label>
                        <select
                            id="submission_type"
                            name="submission_type"
                            v-model="form.submission_type"
                            required
                            class="form-control"
                        >
                            <option value="" disabled>Select a type</option>
                            <option
                                v-for="option in submission_type_options"
                                :key="option"
                                :value="option"
                            >
                                {{ option }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Message: <br /></label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            v-model="form.message"
                            required
                            class="form-control"
                        ></textarea>
                    </div>
                    <button type="submit" style="margin-top: 5%" class="submit-button">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    </main>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
}

h2 {
    font-size: 2rem;
}

h3 {
    font-size: 1.2rem;
}

button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #2c3239;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
}

label {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: var(--color-heading);
}

.pgSpace {
    margin-top: 3%;
}

.greetings h1,
.greetings h3 {
    text-align: center;
}

.error-message {
    color: red;
    margin-top: 1rem;
    font-size: 1rem;
}

.form-error {
    color: #c00;
    margin-bottom: 1em;
}

.form-success {
    color: #080;
    margin-bottom: 1em;
    font-size: 1rem;
}
</style>
