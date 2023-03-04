from .base import *


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


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
