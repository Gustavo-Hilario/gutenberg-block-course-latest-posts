import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { RawHTML } from '@wordpress/element';
//eslint-disable-next-line
import { format, dateI18n, __experimentalGetSettings } from '@wordpress/date';

import { useBlockProps } from '@wordpress/block-editor';

import './editor.scss';

export default function Edit( { attributes } ) {
	const { numberOfPosts, displayFeaturedImage } = attributes;
	const posts = useSelect(
		( select ) => {
			return select( 'core' ).getEntityRecords( 'postType', 'post', {
				per_page: numberOfPosts,
				_embed: true,
			} );
		},
		[ numberOfPosts ]
	);

	return (
		<ul { ...useBlockProps() }>
			{ posts &&
				posts.map( ( post ) => {
					const hasFeaturedImage =
						post._embedded &&
						post._embedded[ 'wp:featuredmedia' ] &&
						post._embedded[ 'wp:featuredmedia' ].length > 0 &&
						post._embedded[ 'wp:featuredmedia' ][ 0 ];

					return (
						<li key={ post.id }>
							{ displayFeaturedImage && hasFeaturedImage && (
								<img
									src={
										post._embedded[
											'wp:featuredmedia'
										][ 0 ].media_details.sizes.thumbnail
											.source_url
									}
									alt={
										post._embedded[
											'wp:featuredmedia'
										][ 0 ].alt_text
									}
								/>
							) }
							<a href={ post.link }>
								<h4>
									<RawHTML>
										{ post.title.rendered
											? post.title.rendered
											: __( 'Untitled', 'latest-posts' ) }
									</RawHTML>
								</h4>
							</a>
							{ post.date_gmt && (
								<span>
									<time
										dateTime={ format(
											'c',
											post.date_gmt
										) }
									>
										{ dateI18n(
											__experimentalGetSettings().formats
												.date,
											post.date_gmt
										) }
									</time>
								</span>
							) }

							{ post.excerpt && (
								<RawHTML>{ post.excerpt.rendered }</RawHTML>
							) }
						</li>
					);
				} ) }
		</ul>
	);
}
