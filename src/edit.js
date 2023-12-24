import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { RawHTML, useState } from '@wordpress/element';
//eslint-disable-next-line
import { format, dateI18n, __experimentalGetSettings } from '@wordpress/date';

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl,
	QueryControls,
	SearchControl,
} from '@wordpress/components';

import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { numberOfPosts, displayFeaturedImage, order, orderBy, categories } =
		attributes;
	const [ searchInput, setSearchInput ] = useState( '' );

	const categoryIds =
		categories &&
		categories.length > 0 &&
		categories.map( ( category ) => category.id );

	const posts = useSelect(
		( select ) => {
			return select( 'core' ).getEntityRecords( 'postType', 'post', {
				per_page: numberOfPosts,
				_embed: true,
				order,
				orderby: orderBy,
				search: searchInput,
				categories: categoryIds ? categoryIds : [],
			} );
		},
		[ numberOfPosts, order, orderBy, searchInput, categories ]
	);

	const allCategories = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
			per_page: -1,
		} );
	}, [] );

	const categorySuggestions = {};

	// Generate a list of categories
	if ( allCategories ) {
		for ( let i = 0; i < allCategories.length; i++ ) {
			const cat = allCategories[ i ];
			categorySuggestions[ cat.name ] = cat;
		}
	}

	const onCategoryChange = ( values ) => {
		const hasNoSuggestions = values.some(
			( value ) =>
				typeof value === 'string' && ! categorySuggestions[ value ]
		);

		if ( hasNoSuggestions ) return;

		const updatedCategories = values.map( ( value ) => {
			if ( typeof value === 'string' ) {
				return categorySuggestions[ value ];
			}

			return value;
		} );

		setAttributes( {
			categories: updatedCategories,
		} );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Block Settings' ) }>
					<ToggleControl
						label={ __( 'Display Featured Image', 'latest-posts' ) }
						checked={ displayFeaturedImage }
						onChange={ () =>
							setAttributes( {
								displayFeaturedImage: ! displayFeaturedImage,
							} )
						}
					/>

					<QueryControls
						numberOfItems={ numberOfPosts }
						onNumberOfItemsChange={ ( value ) => {
							setAttributes( {
								numberOfPosts: value,
							} );
						} }
						maxItems={ 10 }
						minItems={ 1 }
						orderBy={ orderBy }
						onOrderByChange={ ( value ) => {
							setAttributes( { orderBy: value } );
						} }
						order={ order }
						onOrderChange={ ( value ) => {
							setAttributes( { order: value } );
						} }
						categorySuggestions={ categorySuggestions }
						selectedCategories={ categories }
						onCategoryChange={ onCategoryChange }
					/>
					<SearchControl
						label={ __( 'Search Posts' ) }
						value={ searchInput }
						onChange={ ( value ) => setSearchInput( value ) }
					/>
				</PanelBody>
			</InspectorControls>
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
								<h5>
									<a href={ post.link }>
										<RawHTML>
											{ post.title.rendered
												? post.title.rendered
												: __(
														'Untitled',
														'latest-posts'
												  ) }
										</RawHTML>
									</a>
								</h5>
								{ post.date_gmt && (
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
								) }

								{ post.excerpt && (
									<p>
										<RawHTML>
											{ post.excerpt.rendered }
										</RawHTML>
									</p>
								) }
							</li>
						);
					} ) }
			</ul>
		</>
	);
}
