"""
Django settings for gt_back project.

Generated by 'django-admin startproject' using Django 4.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

import os
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
env.read_env(".env")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-0sdey#fbi*x-ar3*2@*f33@+0q&)m3i_3f34#_0j^uw6h%b11s"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "tickets.apps.TicketsConfig",
    "user_relations.apps.UserRelationsConfig",
    "user_settings.apps.UserSettingsConfig",
    "users.apps.UsersConfig",
    "sass_processor",  # MYMEMO: 不要かも
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "gt_back.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "static")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "gt_back.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": env.get_value("DB_NAME", default=None),
        "USER": env.get_value("DB_USER", default=None),
        "PASSWORD": env.get_value("DB_PASS", default=None),
        "HOST": env.get_value("DB_HOST", default=None),
        "PORT": env.get_value("DB_PORT", default="5432"),
        "TEST": {
            "NAME": env.get_value("TEST_DB_NAME"),
        },
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTH_USER_MODEL = "users.User"

# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = "static/"
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static", "dist", "static"),
    os.path.join(BASE_DIR, "static", "images"),
)

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Logging
#  https://docs.djangoproject.com/en/2.0/topics/logging/
LOGGING = {
    "version": 1,
    "desable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "gt_back.logging.Formatter",
            "format": "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "django.log",
            "maxBytes": 50 * 1000 * 1000,
            "backupCount": 1,
            "formatter": "default",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "django.db.backends": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.utils": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "gt_back": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "tickets": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "user_relations": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "user_settings": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "users": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
    },
}

# MYMEMO: 不要かも
SASS_PROCESSOR_ROOT = os.path.join(BASE_DIR, "static")
SASS_PROCESSOR_INCLUDE_FILE_PATTERN = r"^.+\.(sass|scss)$"
SASS_PRECISION = 8
SASS_OUTPUT_STYLE = "compressed"
SASS_TEMPLATE_EXTS = [".html", ".haml"]

# MYMEMO: 本番用の設定必要
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:8080",
    "http://localhost:8080",
]
