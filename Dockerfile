FROM php:7.0-apache
 

RUN apt-get update \
	&& apt-get install -y libapache2-mod-bw

# Enable Apache mod_rewrite
RUN a2enmod rewrite
RUN a2enmod bw

RUN mkdir /var/www/html/assets
# Volumes ?
# VOLUME /var/www/html/assets
RUN usermod -u 1000 www-data
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 0775 /var/www/html/

EXPOSE 80
# CMD ['apachectl', '-D', 'FOREGROUND']